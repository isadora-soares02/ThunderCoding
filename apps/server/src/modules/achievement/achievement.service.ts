import type { PrismaClient } from "../../generated/prisma/client";
import { calculateLevel } from "../../utils/xp";

type Tx = Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function syncUserAchievements(tx: Tx, userId: string) {
    const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        include: {
            lessonProgress: {
                where: { completed: true },
            },
            courseProgress: {
                where: { completed: true },
            },
            taskProgress: {
                where: { completed: true },
            },
        },
    });

    const totalLessonsCompleted = user.lessonProgress.length;
    const totalCoursesCompleted = user.courseProgress.length;
    const totalTasksCompleted = user.taskProgress.length;

    const achievements = await tx.achievement.findMany({
        where: {
            status: "PUBLISHED",
        },
    });

    const unlocked: string[] = [];

    for (const achievement of achievements) {
        const state = calculateAchievementState({
            criterion: achievement.criterion,
            userXp: user.xp,
            userLevel: user.level,
            streak: user.streak,
            completedLessons: totalLessonsCompleted,
            completedCourses: totalCoursesCompleted,
            completedTasks: totalTasksCompleted,
        });

        const previous = await tx.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId: achievement.id,
                },
            },
        });

        const shouldGiveBonus = state.unlocked && !previous?.unlocked;

        await tx.userAchievement.upsert({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId: achievement.id,
                },
            },
            update: {
                progress: state.progress,
                unlocked: state.unlocked,
            },
            create: {
                userId,
                achievementId: achievement.id,
                progress: state.progress,
                unlocked: state.unlocked,
            },
        });

        if (shouldGiveBonus) {
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    xp: {
                        increment: achievement.xpBonus,
                    },
                },
            });

            const nivelData = calculateLevel(updatedUser.xp);

            await tx.user.update({
                where: { id: userId },
                data: {
                    level: nivelData.level,
                },
            });

            unlocked.push(achievement.name);
        }
    }

    return {
        unlocked,
    };
}

function calculateAchievementState(input: {
    criterion: string;
    userXp: number;
    userLevel: number;
    streak: number;
    completedLessons: number;
    completedCourses: number;
    completedTasks: number
}) {
    const criterion = input.criterion.toLowerCase();

    if (criterion.includes("1 aula")) {
        return progress(input.completedLessons, 1);
    }

    if (criterion.includes("primeira aula")) {
        return progress(input.completedLessons, 1);
    }

    if (criterion.includes("7") && criterion.includes("streak")) {
        return progress(input.streak, 7);
    }

    if (criterion.includes("streak de 7")) {
        return progress(input.streak, 7);
    }

    if (criterion.includes("curso") && criterion.includes("conclu")) {
        return progress(input.completedCourses, 1);
    }

    if (criterion.includes("100%")) {
        return progress(input.completedCourses, 1);
    }

    if (criterion.includes("nível 5") || criterion.includes("nivel 5")) {
        return progress(input.userLevel, 5);
    }

    if (criterion.includes("1000 xp")) {
        return progress(input.userXp, 1000);
    }

    if (criterion.includes("tarefa") || criterion.includes("missão")) {
        return progress(input.completedTasks, 1);
    }

    return {
        progress: 0,
        unlocked: false,
    };
}

function progress(current: number, target: number) {
    const progress = Math.min(100, Math.round((current / target) * 100));

    return {
        progress,
        unlocked: progress >= 100,
    };
}
