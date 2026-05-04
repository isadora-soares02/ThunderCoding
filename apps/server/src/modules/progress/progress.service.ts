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

export async function recalculateUserTrailProgress(
    tx: Tx,
    userId: string,
    trailId: string
) {
    const trailCourses = await tx.trailCourse.findMany({
        where: { trailId },
        select: {
            courseId: true,
        },
    });

    if (trailCourses.length === 0) {
        return {
            progress: 0,
            totalCourses: 0,
        };
    }

    const courseIds = trailCourses.map((item) => item.courseId);

    const progresses = await tx.userCourseProgress.findMany({
        where: {
            userId,
            courseId: {
                in: courseIds,
            },
        },
        select: {
            courseId: true,
            progress: true,
        },
    });

    const progressMap = new Map(
        progresses.map((item) => [item.courseId, item.progress])
    );

    const totalProgress = courseIds.reduce((acc, courseId) => acc + (progressMap.get(courseId) ?? 0), 0);

    const progress = Math.round(totalProgress / courseIds.length);

    return {
        progress,
        totalCourses: courseIds.length,
    };
}

export async function recalculateAllUserTrailsForCourse(
    tx: Tx,
    userId: string,
    courseId: string
) {
    const trailLinks = await tx.trailCourse.findMany({
        where: { courseId },
        select: {
            trailId: true,
        },
    });

    const results = [];

    for (const link of trailLinks) {
        const result = await recalculateUserTrailProgress(tx, userId, link.trailId);

        results.push({
            trailId: link.trailId,
            ...result,
        });
    }

    return results
}