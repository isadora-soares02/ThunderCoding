import type { Course, Trail, TrailCourse } from "../../generated/prisma/client";
import { fromCourseStatus, fromDifficulty } from "../../utils/enums";
import { courseToResponse } from "../courses/course.mapper";

type TrailWithCourses = Trail & {
    courses?: Array<
        TrailCourse & {
            course: Course & {
                _count?: {
                    lessons: number;
                };
            };
        }
    >;
};

export function trailToResponse(trail: TrailWithCourses, userProgress?: number) {
    const orderedCourses = [...(trail.courses ?? [])].sort(
        (a, b) => a.order - b.order
    );

    return {
        id: trail.id,
        name: trail.name,
        description: trail.description,
        level: fromDifficulty(trail.level),
        courseIds: orderedCourses.map((item) => item.courseId),
        courses: orderedCourses.map((item) => courseToResponse(item.course)),
        totalXp: trail.totalXp,
        progress: userProgress ?? 0,
        status: fromCourseStatus(trail.status),
        color: trail.color ?? "primary",
        icon: trail.icon ?? "Sparkles",
        createdAt: trail.createdAt,
        updatedAt: trail.updatedAt,
    };
}
