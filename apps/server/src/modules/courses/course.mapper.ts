import type { Course } from "../../generated/prisma/client";
import { fromCourseStatus, fromDifficulty } from "../../utils/enums";

type CourseWithCount = Course & {
    _count?: {
        lessons: number;
    };
    progress?: {
        progress: number;
        completed: boolean;
    }[];
};

export function courseToResponse(course: CourseWithCount) {
    const userProgress = course.progress?.[0];

    return {
        id: course.id,
        title: course.title,
        description: course.description,
        language: course.language,
        level: fromDifficulty(course.level),
        duration: course.duration,
        xp: course.xp,
        totalLessons: course._count?.lessons ?? 0,
        progress: userProgress?.progress ?? 0,
        completed: userProgress?.completed ?? false,
        instructor: course.instructor,
        banner: course.banner ?? "",
        color: course.color ?? "primary",
        status: fromCourseStatus(course.status),
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
    };
}
