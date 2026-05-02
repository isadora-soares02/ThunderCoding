import { fromLessonType } from "../../utils/enums.js";

export function lessonToResponse(lesson: any) {
    return {
        id: lesson.id,
        courseId: lesson.courseId,
        title: lesson.title,
        type: fromLessonType(lesson.type),
        content: lesson.content,
        videoUrl: lesson.videoUrl ?? "",
        order: lesson.order,
        xp: lesson.xp,
        durationMin: lesson.durationMin,
        completed: lesson.progress?.[0]?.completed ?? false,
    };
}
