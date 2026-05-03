import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { getSession, requireAdmin, requireAuth } from "../../plugins/auth.js";
import {
    answerQuestionSchema,
    createQuestionSchema,
    updateQuestionSchema,
} from "../../schemas/quiz.schema.js";
import { toAnswerKey, toDifficulty } from "../../utils/enums.js";
import { calculateLevel } from "../../utils/xp.js";
import { syncUserAchievements } from "../achievement/achievement.service.js";
import { completeLinkedLessonFromQuestion } from "../progress/linked-session.service.js";
import { recalculateCourseProgress } from "../progress/progress.service.js";
import { questionToResponse } from "./quiz.mapper.js";

export function quizRoutes(app: FastifyInstance) {
    app.get("/quizzes/:courseId", async (request) => {
        const { courseId } = z
            .object({ courseId: z.string() })
            .parse(request.params);

        const session = await getSession(request);
        const userId = session?.user.id;

        const questions = await prisma.question.findMany({
            where: {
                courseId,
            },
            include: userId
                ? {
                    progress: {
                        where: {
                            userId,
                        },
                    },
                }
                : undefined,
        });

        return {
            questions: questions.map(questionToResponse),
        };
    });

    app.post(
        "/quizzes/answer",
        { preHandler: requireAuth },
        async (request, reply) => {
            const body = answerQuestionSchema.parse(request.body);
            const userId = request.user!.id;

            const question = await prisma.question.findUnique({
                where: { id: body.questionId },
            });

            if (!question) {
                return reply.status(404).send({
                    message: "Pergunta não encontrada.",
                });
            }

            const correta = question.correct;
            const resposta = toAnswerKey(body.answer);

            const acertou = resposta === correta;

            const previous = await prisma.userQuestionProgress.findUnique({
                where: {
                    userId_questionId: {
                        userId,
                        questionId: question.id,
                    },
                },
            });

            if (previous?.completed) {
                return {
                    correct: previous.correct,
                    xpEarned: 0,
                    alreadyAnswered: true,
                    correctAnswer: question.correct.toLowerCase(),
                    explanation: question.explanation,
                    message: "Pergunta já respondida. Revisão liberada, mas sem novo XP.",
                };
            }

            const result = await prisma.$transaction(async (tx) => {
                let xpEarned = 0;

                if (acertou) {
                    xpEarned = question.xp;
                }

                await tx.userQuestionProgress.create({
                    data: {
                        userId,
                        questionId: question.id,
                        completed: true,
                        correct: acertou,
                        answer: resposta,
                        xpEarned,
                    },
                });

                await completeLinkedLessonFromQuestion(tx, userId, question.id);

                let nivel = 1;

                if (xpEarned > 0) {
                    const updatedUser = await tx.user.update({
                        where: {
                            id: userId,
                        },
                        data: {
                            xp: {
                                increment: xpEarned,
                            },
                        },
                    });

                    const nivelData = calculateLevel(updatedUser.xp);
                    nivel = nivelData.level;

                    await tx.user.update({
                        where: {
                            id: userId,
                        },
                        data: {
                            level: nivel,
                        },
                    });
                }

                const courseProgress = await recalculateCourseProgress(
                    tx,
                    userId,
                    question.courseId
                );

                const achievements = await syncUserAchievements(tx, userId);

                return {
                    correct: acertou,
                    xpEarned,
                    level: nivel,
                    progress: courseProgress.progress,
                    completed: courseProgress.completed,
                    unlockedAchievements: achievements.unlocked,
                };
            });

            return {
                ...result,
                correctAnswer: question.correct.toLowerCase(),
                explanation: question.explanation,
                alreadyAnswered: false,
            };
        }
    );

    app.get("/questions/:id", async (request, reply) => {
        const { id } = z.object({ id: z.string() }).parse(request.params);

        const session = await getSession(request);
        const userId = session?.user.id;

        const question = await prisma.question.findUnique({
            where: {
                id,
            },
            include: userId
                ? {
                    progress: {
                        where: {
                            userId,
                        },
                    },
                }
                : undefined,
        });

        if (!question) {
            return reply.status(404).send({
                message: "Pergunta não encontrada.",
            });
        }

        return {
            question: questionToResponse(question),
        };
    });

    app.get("/quizzes/question/:id", async (request, reply) => {
        const { id } = z.object({ id: z.string() }).parse(request.params);

        const startQuestion = await prisma.question.findUnique({
            where: { id },
        });

        if (!startQuestion) {
            return reply.status(404).send({
                message: "Quiz não encontrado.",
            });
        }

        const questions = await prisma.question.findMany({
            where: {
                courseId: startQuestion.courseId,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return {
            startQuestion: questionToResponse(startQuestion),
            questions: questions.map(questionToResponse),
        };
    });

    app.post(
        "/admin/questions",
        { preHandler: requireAdmin },
        async (request) => {
            const body = createQuestionSchema.parse(request.body);

            const question = await prisma.question.create({
                data: {
                    courseId: body.courseId,
                    question: body.question,
                    optionA: body.a,
                    optionB: body.b,
                    optionC: body.c,
                    optionD: body.d,
                    correct: toAnswerKey(body.correct),
                    explanation: body.explanation,
                    xp: body.xp,
                    difficulty: toDifficulty(body.difficulty),
                },
            });

            return {
                message: "Pergunta criada com sucesso.",
                question,
            };
        }
    );

    app.patch(
        "/admin/questions/:id",
        { preHandler: requireAdmin },
        async (request) => {
            const { id } = z.object({ id: z.string() }).parse(request.params);
            const body = updateQuestionSchema.parse(request.body);

            const question = await prisma.question.update({
                where: { id },
                data: {
                    question: body.question,
                    optionA: body.a,
                    optionB: body.b,
                    optionC: body.c,
                    optionD: body.d,
                    correct: body.correct ? toAnswerKey(body.correct) : undefined,
                    explanation: body.explanation,
                    xp: body.xp,
                    difficulty: body.difficulty
                        ? toDifficulty(body.difficulty)
                        : undefined,
                },
            });

            return {
                message: "Pergunta atualizada.",
                question,
            };
        }
    );

    app.delete(
        "/admin/questions/:id",
        { preHandler: requireAdmin },
        async (request) => {
            const { id } = z.object({ id: z.string() }).parse(request.params);

            await prisma.question.delete({
                where: { id },
            });

            return {
                message: "Pergunta removida.",
            };
        }
    );
}
