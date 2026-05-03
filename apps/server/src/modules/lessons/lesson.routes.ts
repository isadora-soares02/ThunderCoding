import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { getSession, requireAdmin, requireAuth } from "../../plugins/auth.js";
import {
    createLessonSchema,
    updateLessonSchema,
} from "../../schemas/lesson.schema.js";
import { toLessonType } from "../../utils/enums.js";
import { calculateLevel } from "../../utils/xp.js";
import { syncUserAchievements } from "../achievement/achievement.service.js";
import { recalculateCourseProgress } from "../progress/progress.service.js";
import { lessonToResponse } from "./lesson.mapper.js";

export function lessonRoutes(app: FastifyInstance) {
    app.get("/courses/:id/lessons", async (request) => {
        const { id } = z.object({ id: z.string() }).parse(request.params);

        const lessons = await prisma.lesson.findMany({
            where: {
                courseId: id,
            },
            orderBy: {
                order: "asc",
            },
        });

        return {
            lessons: lessons.map(lessonToResponse),
        };
    });

    app.get(
        "/lessons/:id",
        {
            preHandler: requireAuth,
        },
        async (request, reply) => {
            const { id } = z.object({ id: z.string() }).parse(request.params);

            const session = await getSession(request);
            const userId = session?.user.id;

            const lesson = await prisma.lesson.findUnique({
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

            if (!lesson) {
                return reply.status(404).send({
                    message: "Aula não encontrada.",
                });
            }

            return {
                lesson: lessonToResponse(lesson),
            };
        }
    );

    app.post(
        "/lessons/:id/complete",
        {
            preHandler: requireAuth,
        },
        async (request, reply) => {
            const { id } = z.object({ id: z.string() }).parse(request.params);

            const userId = request.user!.id;

            const lesson = await prisma.lesson.findUnique({
                where: { id },
            });

            if (!lesson) {
                return reply.status(404).send({
                    message: "Aula não encontrada.",
                });
            }

            const alreadyCompleted = await prisma.userLessonProgress.findUnique({
                where: {
                    userId_lessonId: {
                        userId,
                        lessonId: id,
                    },
                },
            });

            if (alreadyCompleted?.completed) {
                return {
                    message: "Aula já concluída.",
                };
            }

            const result = await prisma.$transaction(async (tx) => {
                await tx.userLessonProgress.upsert({
                    where: {
                        userId_lessonId: {
                            userId,
                            lessonId: id,
                        },
                    },
                    update: {
                        completed: true,
                    },
                    create: {
                        userId,
                        lessonId: id,
                        completed: true,
                    },
                });

                const user = await tx.user.update({
                    where: { id: userId },
                    data: {
                        xp: {
                            increment: lesson.xp,
                        },
                    },
                });

                const nivelData = calculateLevel(user.xp);

                await tx.user.update({
                    where: { id: userId },
                    data: {
                        level: nivelData.level,
                    },
                });

                const courseProgress = await recalculateCourseProgress(
                    tx,
                    userId,
                    lesson.courseId
                );

                await tx.userCourseProgress.upsert({
                    where: {
                        userId_courseId: {
                            userId,
                            courseId: lesson.courseId,
                        },
                    },
                    update: {
                        progress: courseProgress.progress,
                        completed: courseProgress.completed,
                    },
                    create: {
                        userId,
                        courseId: lesson.courseId,
                        progress: courseProgress.progress,
                        completed: courseProgress.completed,
                    },
                });

                const achievements = await syncUserAchievements(tx, userId);

                return {
                    xpEarned: lesson.xp,
                    level: nivelData.level,
                    progress: courseProgress.progress,
                    completed: courseProgress.completed,
                    unlockedAchievements: achievements.unlocked,
                };
            });

            return {
                message: "Aula concluída com sucesso!",
                ...result,
            };
        }
    );

    app.post("/admin/lessons", { preHandler: requireAdmin }, async (request) => {
        const body = createLessonSchema.parse(request.body);

        const lesson = await prisma.lesson.create({
            data: {
                courseId: body.courseId,
                title: body.title,
                type: toLessonType(body.type),
                content: body.content,
                videoUrl: body.videoUrl || null,
                order: body.order,
                xp: body.xp,
                durationMin: body.durationMin,
                taskId: body.type === "tarefa" ? body.taskId : null,
                questionId: body.type === "quiz" ? body.questionId : null,
            },
        });

        return {
            message: "Aula criada com sucesso.",
            lesson,
        };
    });

    app.patch(
        "/admin/lessons/:id",
        { preHandler: requireAdmin },
        async (request) => {
            const { id } = z.object({ id: z.string() }).parse(request.params);
            const body = updateLessonSchema.parse(request.body);

            const lesson = await prisma.lesson.update({
                where: { id },
                data: {
                    title: body.title,
                    content: body.content,
                    type: body.type ? toLessonType(body.type) : undefined,
                    videoUrl: body.videoUrl,
                    order: body.order,
                    xp: body.xp,
                    durationMin: body.durationMin,
                    taskId:
                        body.type === "tarefa"
                            ? body.taskId
                            : body.type
                                ? null
                                : body.taskId,
                    questionId:
                        body.type === "quiz"
                            ? body.questionId
                            : body.type
                                ? null
                                : body.questionId,
                },
            });

            return {
                message: "Aula atualizada.",
                lesson,
            };
        }
    );

    app.delete(
        "/admin/lessons/:id",
        { preHandler: requireAdmin },
        async (request) => {
            const { id } = z.object({ id: z.string() }).parse(request.params);

            await prisma.lesson.delete({
                where: { id },
            });

            return {
                message: "Aula removida.",
            };
        }
    );
}
