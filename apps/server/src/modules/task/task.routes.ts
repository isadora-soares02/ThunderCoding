import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { getSession, requireAdmin, requireAuth } from "../../plugins/auth.js";
import {
    createTaskSchema,
    submitTaskSchema,
    updateTaskSchema,
} from "../../schemas/task.schema.js";
import { calculateLevel } from "../../utils/xp.js";
import { syncUserAchievements } from "../achievement/achievement.service.js";
import { taskToResponse } from "./task.mapper.js";

export function taskRoutes(app: FastifyInstance) {
    app.get("/courses/:courseId/tasks", async (request) => {
        const { courseId } = z
            .object({ courseId: z.string() })
            .parse(request.params);

        const userId = request.user!.id;

        const tasks = await prisma.task.findMany({
            where: {
                courseId,
            },
            include: userId
                ? {
                    progress: {
                        where: { userId },
                    },
                }
                : undefined,
            orderBy: {
                createdAt: "asc",
            },
        });

        return {
            tasks: tasks.map(taskToResponse),
        };
    });

    app.get("/api/tasks/:id", async (request, reply) => {
        const { id } = z.object({ id: z.string() }).parse(request.params);

        const userId = request.user!.id;

        const task = await prisma.task.findUnique({
            where: { id },
            include: userId
                ? {
                    progress: {
                        where: { userId },
                    },
                }
                : undefined,
        });

        if (!task) {
            return reply.status(404).send({
                message: "Tarefa não encontrada.",
            });
        }

        return {
            task: taskToResponse(task),
        };
    });

    app.post(
        "/api/tasks/:id/submit",
        {
            preHandler: requireAuth,
        },
        async (request, reply) => {
            const { id } = z.object({ id: z.string() }).parse(request.params);
            const body = submitTaskSchema.parse(request.body);

            const session = await getSession(request);
            const userId = session?.user?.id;

            const task = await prisma.task.findUnique({
                where: { id },
            });

            if (!task) {
                return reply.status(404).send({
                    message: "Tarefa não encontrada.",
                });
            }

            const previous = await prisma.userTaskProgress.findUnique({
                where: {
                    userId_taskId: {
                        userId,
                        taskId: id,
                    },
                },
            });

            if (previous?.completed) {
                return {
                    message: "Tarefa já concluída.",
                    xpEarned: 0,
                    completed: true,
                    unlockedAchievements: [],
                };
            }

            const result = await prisma.$transaction(async (tx) => {
                await tx.userTaskProgress.upsert({
                    where: {
                        userId_taskId: {
                            userId,
                            taskId: id,
                        },
                    },
                    update: {
                        completed: true,
                        answer: body.answer,
                    },
                    create: {
                        userId,
                        taskId: id,
                        completed: true,
                        answer: body.answer,
                    },
                });

                const updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: {
                        xp: {
                            increment: task.xp,
                        },
                    },
                });

                const levelData = calculateLevel(updatedUser.xp);

                await tx.user.update({
                    where: { id: userId },
                    data: {
                        level: levelData.level,
                    },
                });

                const achievements = await syncUserAchievements(tx, userId);

                return {
                    xpEarned: task.xp,
                    level: levelData.level,
                    unlockedAchievements: achievements.unlocked,
                };
            });

            return {
                message: "Parabéns, missão concluída!",
                completed: true,
                ...result,
            };
        }
    );

    app.post(
        "/api/admin/tasks",
        {
            preHandler: requireAdmin,
        },
        async (request, reply) => {
            const body = createTaskSchema.parse(request.body);

            const task = await prisma.task.create({
                data: {
                    courseId: body.courseId,
                    title: body.title,
                    description: body.description,
                    objective: body.objective,
                    xp: body.xp,
                    estimatedTime: body.estimatedTime,
                    requirements: body.requirements,
                },
            });

            return reply.status(201).send({
                message: "Tarefa criada com sucesso.",
                task: taskToResponse(task),
            });
        }
    );

    app.patch(
        "/api/admin/tasks/:id",
        {
            preHandler: requireAdmin,
        },
        async (request) => {
            const { id } = z.object({ id: z.string() }).parse(request.params);
            const body = updateTaskSchema.parse(request.body);

            const task = await prisma.task.update({
                where: { id },
                data: {
                    courseId: body.courseId,
                    title: body.title,
                    description: body.description,
                    objective: body.objective,
                    xp: body.xp,
                    estimatedTime: body.estimatedTime,
                    requirements: body.requirements,
                },
            });

            return {
                message: "Tarefa atualizada com sucesso.",
                task: taskToResponse(task),
            };
        }
    );

    app.delete(
        "/api/admin/tasks/:id",
        {
            preHandler: requireAdmin,
        },
        async (request) => {
            const { id } = z.object({ id: z.string() }).parse(request.params);

            await prisma.task.delete({
                where: { id },
            });

            return {
                message: "Tarefa removida com sucesso.",
            };
        }
    );
}
