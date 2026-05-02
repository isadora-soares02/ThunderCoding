import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../plugins/auth.js";

export function adminRoutes(app: FastifyInstance) {
    app.get(
        "/admin/stats",
        {
            preHandler: requireAdmin,
        },
        async () => {
            const [
                totalCourses,
                totalTrails,
                totalLessons,
                totalQuestions,
                totalUsers,
                totalAchievements,
            ] = await Promise.all([
                prisma.course.count(),
                prisma.trail.count(),
                prisma.lesson.count(),
                prisma.question.count(),
                prisma.user.count(),
                prisma.achievement.count(),
            ]);

            const mostAccessedCourses = await prisma.course.findMany({
                include: {
                    _count: {
                        select: {
                            progress: true,
                        },
                    },
                },
                orderBy: {
                    progress: {
                        _count: "desc",
                    },
                },
                take: 5,
            });

            const latestCourses = await prisma.course.findMany({
                orderBy: {
                    updatedAt: "desc",
                },
                take: 4,
                select: {
                    title: true,
                    updatedAt: true,
                },
            });

            const latestQuestions = await prisma.question.findMany({
                orderBy: {
                    updatedAt: "desc",
                },
                take: 4,
                select: {
                    question: true,
                    updatedAt: true,
                },
            });

            return {
                totalCourses,
                totalTrails,
                totalLessons,
                totalQuestions,
                totalUsers,
                totalAchievements,
                mostAccessedCourses: mostAccessedCourses.map((course) => ({
                    title: course.title,
                    accesses: course._count.progress,
                })),
                latestUpdates: [
                    ...latestCourses.map((course) => ({
                        type: "Course",
                        title: course.title,
                        date: course.updatedAt,
                    })),
                    ...latestQuestions.map((question) => ({
                        type: "Question",
                        title: question.question,
                        date: question.updatedAt,
                    })),
                ].sort((a, b) => b.date.getTime() - a.date.getTime()),
            };
        }
    );
}