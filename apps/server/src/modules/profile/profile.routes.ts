import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { getSession, requireAuth } from "../../plugins/auth.js";
import { calculateLevel } from "../../utils/xp.js";
import { achievementToResponse } from "../achievement/achievement.mapper.js";
import { courseToResponse } from "../courses/course.mapper.js";

export function profileRoutes(app: FastifyInstance) {
    app.get("/profile", { preHandler: requireAuth }, async (request) => {
        const session = await getSession(request);
        const userId = session?.user?.id;

        const user = await prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                xp: true,
                level: true,
                streak: true,
                completedCourses: true,
                role: true,
            },
        });

        const nivelData = calculateLevel(user.xp);

        const progresses = await prisma.userCourseProgress.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        _count: {
                            select: { lessons: true },
                        },
                        progress: {
                            where: { userId },
                        },
                    },
                },
            },
        });

        const achievements = await prisma.achievement.findMany({
            where: { status: "PUBLISHED" },
            include: {
                users: {
                    where: { userId },
                },
            },
        });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.image,
                xp: user.xp,
                level: user.level,
                streak: user.streak,
                completedCourses: user.completedCourses,
                isAdmin: user.role === "ADMIN",
                currentXp: nivelData.currentXp,
                xpPerLevel: nivelData.xpPerLevel,
                levelProgressPercentage: nivelData.percentage,
            },
            courses: progresses.map((item) => courseToResponse(item.course)),
            achievements: achievements.map(achievementToResponse),
        };
    });
}
