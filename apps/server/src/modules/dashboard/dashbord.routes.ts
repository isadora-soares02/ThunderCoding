import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { getSession, requireAuth } from "../../plugins/auth.js";
import { calculateLevel } from "../../utils/xp.js";
import { achievementToResponse } from "../achievement/achievement.mapper.js";
import { courseToResponse } from "../courses/course.mapper.js";

export function dashboardRoutes(app: FastifyInstance) {
    app.get("/dashboard", { preHandler: requireAuth }, async (request) => {
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

        const coursesInProgress = await prisma.course.findMany({
            where: {
                status: "PUBLISHED",
                progress: {
                    some: {
                        userId,
                        progress: {
                            gt: 0,
                            lt: 100,
                        },
                    },
                },
            },
            include: {
                _count: {
                    select: { lessons: true },
                },
                progress: {
                    where: { userId },
                },
            },
            take: 3,
        });

        const recommendedTrails = await prisma.trail.findMany({
            where: {
                status: "PUBLISHED",
            },
            include: {
                courses: {
                    include: {
                        course: {
                            include: {
                                _count: {
                                    select: { lessons: true },
                                },
                            },
                        },
                    },
                },
            },
            take: 3,
        });

        const recentAchievements = await prisma.achievement.findMany({
            where: {
                status: "PUBLISHED",
                users: {
                    some: {
                        userId,
                        unlocked: true,
                    },
                },
            },
            include: {
                users: {
                    where: { userId },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 4,
        });

        const totalCourses = await prisma.course.count({
            where: { status: "PUBLISHED" },
        });

        const completedCourses = await prisma.userCourseProgress.count({
            where: {
                userId,
                completed: true,
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
            resume: {
                totalCourses,
                completedCourses,
                coursesInProgress: coursesInProgress.length,
            },
            coursesInProgress: coursesInProgress.map(courseToResponse),
            recommendedTrails: recommendedTrails.map((trail) => ({
                id: trail.id,
                name: trail.name,
                description: trail.description,
                totalXp: trail.totalXp,
                progress: trail.progress,
                color: trail.color ?? "primary",
                icon: trail.icon ?? "Sparkles",
                courseIds: trail.courses.map((item) => item.courseId),
            })),
            recentAchievements: recentAchievements.map(achievementToResponse),
        };
    });
}
