import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import type { Course, Lesson, Question, Task } from "@/types";

export interface CourseDetailResponse {
    course: Course;
    lessons: Lesson[];
    totalQuestions: number;
    totalTasks: number;
}

interface TasksResponse {
    tasks: Task[];
}

interface QuizzesResponse {
    questions: Question[];
}

export function useCourseDetail(id?: string) {
    const courseQuery = useQuery({
        queryKey: ["course", id],
        queryFn: () => apiFetch<CourseDetailResponse>(`/api/courses/${id}`),
        enabled: !!id,
    });

    const tasksQuery = useQuery({
        queryKey: ["course-tasks", id],
        queryFn: () => apiFetch<TasksResponse>(`/api/courses/${id}/tasks`),
        enabled: !!id,
    });

    const quizzesQuery = useQuery({
        queryKey: ["course-quizzes", id],
        queryFn: () => apiFetch<QuizzesResponse>(`/api/quizzes/${id}`),
        enabled: !!id,
    });

    return {
        course: courseQuery.data?.course,
        lessons: courseQuery.data?.lessons ?? [],
        tasks: tasksQuery.data?.tasks ?? [],
        questions: quizzesQuery.data?.questions ?? [],
        isLoading:
            courseQuery.isLoading || tasksQuery.isLoading || quizzesQuery.isLoading,
        isError: courseQuery.isError || tasksQuery.isError || quizzesQuery.isError,
        error: courseQuery.error || tasksQuery.error || quizzesQuery.error,
    };
}
