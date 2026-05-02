import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin, requireAuth } from "../../plugins/auth.js";
import {
    createAchievementSchema,
    updateAchievementSchema,
} from "../../schemas/achievement.schema.js";
import { toCourseStatus } from "../../utils/enums.js";
import { achievementToResponse } from "./achievement.mapper.js";
import { syncUserAchievements } from "./achievement.service.js";

export function achievementRoutes(app: FastifyInstance) {
    app.get(
        "/achievements",
        {
            preHandler: requireAuth,
        },
        async (request) => {
            const userId = request.user!.id;

            await prisma.$transaction(async (tx) => {
                await syncUserAchievements(tx, userId);
            });

            const achievements = await prisma.achievement.findMany({
                where: {
                    status: "PUBLISHED",
                },
                include: {
                    users: {
                        where: {
                            userId,
                        },
                    },
                },
                orderBy: {
                    createdAt: "asc",
                },
            });

            return {
                achievements: achievements.map(achievementToResponse),
            };
        }
    );

    app.post(
        "/api/admin/achievements",
        {
            preHandler: requireAdmin,
        },
        async (request, reply) => {
            const body = createAchievementSchema.parse(request.body);

            const achievement = await prisma.achievement.create({
                data: {
                    name: body.name,
                    description: body.description,
                    icon: body.icon,
                    criterion: body.criterion,
                    xpBonus: body.xpBonus,
                    status: toCourseStatus(body.status),
                },
            });

            return reply.status(201).send({
                message: "Conquista criada com sucesso.",
                achievement: achievementToResponse(achievement),
            });
        }
    );

    app.patch(
        "/api/admin/achievements/:id",
        {
            preHandler: requireAdmin,
        },
        async (request) => {
            const { id } = z.object({ id: z.string() }).parse(request.params);
            const body = updateAchievementSchema.parse(request.body);

            const achievement = await prisma.achievement.update({
                where: { id },
                data: {
                    name: body.name,
                    description: body.description,
                    icon: body.icon,
                    criterion: body.criterion,
                    xpBonus: body.xpBonus,
                    status: body.status ? toCourseStatus(body.status) : undefined,
                },
            });

            return {
                message: "Conquista atualizada com sucesso.",
                achievement: achievementToResponse(achievement),
            };
        }
    );

    app.delete(
        "/api/admin/achievements/:id",
        {
            preHandler: requireAdmin,
        },
        async (request) => {
            const { id } = z.object({ id: z.string() }).parse(request.params);

            await prisma.achievement.delete({
                where: { id },
            });

            return {
                message: "Conquista removida com sucesso.",
            };
        }
    );
}
