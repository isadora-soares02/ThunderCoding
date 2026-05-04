import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import type { LessonInput } from "@/schemas";
import type { Course, Lesson } from "@/types";

interface CoursesResponse {
    courses: Course[];
}

interface LessonsResponse {
    lessons: Lesson[];
}

interface LessonResponse {
    lesson: Lesson;
    message: string;
}

function toPayload(data: LessonInput) {
    return {
        courseId: data.courseId,
        title: data.title,
        type: data.type,
        content: data.content,
        videoUrl: data.videoUrl || null,
        order: Number(data.order),
        xp: Number(data.xp),
        durationMin: 5,
    };
}

export function useAdminLessons() {
    const queryClient = useQueryClient();

    const coursesQuery = useQuery({
        queryKey: ["admin-courses"],
        queryFn: () => apiFetch<CoursesResponse>("/api/courses"),
    });

    const courseIds = coursesQuery.data?.courses.map((course) => course.id) ?? [];

    const lessonsQuery = useQuery({
        queryKey: ["admin-lessons", courseIds],
        enabled: courseIds.length > 0,
        queryFn: async () => {
            const responses = await Promise.all(
                courseIds.map((courseId) =>
                    apiFetch<LessonsResponse>(`/api/courses/${courseId}/lessons`)
                )
            );

            return responses.flatMap((response) => response.lessons);
        },
    });

    const createLesson = useMutation({
        mutationFn: (data: LessonInput) =>
            apiFetch<LessonResponse>("/api/admin/lessons", {
                method: "POST",
                body: JSON.stringify(toPayload(data)),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
    });

    const updateLesson = useMutation({
        mutationFn: ({ id, data }: { id: string; data: LessonInput }) =>
            apiFetch<LessonResponse>(`/api/admin/lessons/${id}`, {
                method: "PATCH",
                body: JSON.stringify(toPayload(data)),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
    });

    const deleteLesson = useMutation({
        mutationFn: (id: string) =>
            apiFetch<{ message: string }>(`/api/admin/lessons/${id}`, {
                method: "DELETE",
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
    });

    return {
        courses: coursesQuery.data?.courses ?? [],
        lessons: lessonsQuery.data ?? [],

        isLoading: coursesQuery.isLoading || lessonsQuery.isLoading,
        isError: coursesQuery.isError || lessonsQuery.isError,
        error: coursesQuery.error || lessonsQuery.error,

        createLesson,
        updateLesson,
        deleteLesson,
    };
}
