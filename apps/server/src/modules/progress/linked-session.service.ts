import type { PrismaClient } from "../../generated/prisma/client";

type Tx = Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function completeLinkedLessonFromTask(
    tx: Tx,
    userId: string,
    taskId: string
) {
    const lessons = await tx.lesson.findMany({
        where: { taskId },
    });

    for (const lesson of lessons) {
        await tx.userLessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId: lesson.id,
                },
            },
            update: {
                completed: true,
            },
            create: {
                userId,
                lessonId: lesson.id,
                completed: true,
            },
        });
    }
}

export async function completeLinkedLessonFromQuestion(
    tx: Tx,
    userId: string,
    questionId: string
) {
    const lessons = await tx.lesson.findMany({
        where: { questionId },
    });

    for (const lesson of lessons) {
        await tx.userLessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId: lesson.id,
                },
            },
            update: {
                completed: true,
            },
            create: {
                userId,
                lessonId: lesson.id,
                completed: true,
            },
        });
    }
}