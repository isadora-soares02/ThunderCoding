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
    const [totalLessons, totalTasks, totalQuestions] = await Promise.all([
        tx.lesson.count({
            where: { courseId },
        }),
        tx.task.count({
            where: { courseId },
        }),
        tx.question.count({
            where: { courseId },
        }),
    ]);

    const [completedLessons, completedTasks, completedQuestions] =
        await Promise.all([
            tx.userLessonProgress.count({
                where: {
                    userId,
                    completed: true,
                    lesson: {
                        courseId,
                    },
                },
            }),
            tx.userTaskProgress.count({
                where: {
                    userId,
                    completed: true,
                    task: {
                        courseId,
                    },
                },
            }),
            tx.userQuestionProgress.count({
                where: {
                    userId,
                    completed: true,
                    question: {
                        courseId,
                    },
                },
            }),
        ]);

    const totalActivities = totalLessons + totalTasks + totalQuestions;
    const completedActivities =
        completedLessons + completedTasks + completedQuestions;

    const progress =
        totalActivities === 0
            ? 0
            : Math.round((completedActivities / totalActivities) * 100);

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

    if (completed) {
        const completedCourses = await tx.userCourseProgress.count({
            where: {
                userId,
                completed: true,
            },
        });

        await tx.user.update({
            where: { id: userId },
            data: {
                completedCourses,
            },
        });
    }

    return {
        progress,
        completed,
        totalActivities,
        completedActivities,
    };
}
