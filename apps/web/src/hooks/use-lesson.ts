import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import type { Lesson } from "@/types";

interface LessonResponse {
    lesson: Lesson;
}

interface LessonsResponse {
    lessons: Lesson[];
}

interface CompleteLessonResponse {
    conquistasDesbloqueadas: string[];
    message: string;
    nivel: number;
    progresso: number;
    xpGanho: number;
}

export function useLesson(id?: string) {
    return useQuery({
        queryKey: ["lesson", id],
        queryFn: () => apiFetch<LessonResponse>(`/api/lessons/${id}`),
        enabled: !!id,
    });
}

export function useCourseLessons(courseId?: string) {
    return useQuery({
        queryKey: ["course-lessons", courseId],
        queryFn: () =>
            apiFetch<LessonsResponse>(`/api/courses/${courseId}/lessons`),
        enabled: !!courseId,
    });
}

export function useCompleteLesson(id?: string, courseId?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            apiFetch<CompleteLessonResponse>(`/api/lessons/${id}/complete`, {
                method: "POST",
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lesson", id] });
            queryClient.invalidateQueries({ queryKey: ["course-lessons", courseId] });
            queryClient.invalidateQueries({ queryKey: ["course", courseId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["achievements"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
}
