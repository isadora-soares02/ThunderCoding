import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import type { Lesson } from "@/types";

export interface LessonResponse {
    lesson: Lesson;
}

interface LessonsResponse {
    lessons: Lesson[];
}

interface CompleteLessonResponse {
    level: number;
    message: string;
    progress: number;
    unlockedAchievements: string[];
    xpEarned: number;
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

export function useCompleteLesson(id?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            apiFetch<CompleteLessonResponse>(`/api/lessons/${id}/complete`, {
                method: "POST",
                body: JSON.stringify({}),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lesson", id] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            queryClient.invalidateQueries({ queryKey: ["course"] });
            queryClient.invalidateQueries({ queryKey: ["course-lessons"] });
            queryClient.invalidateQueries({ queryKey: ["course-tasks"] });
            queryClient.invalidateQueries({ queryKey: ["course-questions"] });
            queryClient.invalidateQueries({ queryKey: ["achievements"] });
        },
    });
}
