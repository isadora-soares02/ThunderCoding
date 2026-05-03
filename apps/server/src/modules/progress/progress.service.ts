import type { PrismaClient } from "../../generated/prisma/client";

type Tx = Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function recalculateCourseProgress(
    tx: Tx,
    userId: string,
    courseId: string
) {
    const totalLessons = await tx.lesson.count({
        where: { courseId },
    });

    const completedLessons = await tx.userLessonProgress.count({
        where: {
            userId,
            completed: true,
            lesson: {
                courseId,
            },
        },
    });

    const progress =
        totalLessons === 0
            ? 0
            : Math.round((completedLessons / totalLessons) * 100);

    const completed = progress >= 100;

    await tx.userCourseProgress.upsert({
        where: {
            userId_courseId: {
                userId,
                courseId,
            },
        },
        update: {
            progress,
            completed,
        },
        create: {
            userId,
            courseId,
            progress,
            completed,
        },
    });

    return {
        progress,
        completed,
        totalActivities: totalLessons,
        completedActivities: completedLessons,
    };
}

