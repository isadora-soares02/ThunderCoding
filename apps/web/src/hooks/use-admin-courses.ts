import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import type { CourseInput } from "@/schemas";
import type { Course } from "@/types";

interface CoursesResponse {
    courses: Course[];
}

interface CourseResponse {
    course: Course;
    message: string;
}

interface AdminCoursePayload {
    banner?: string;
    color?: string;
    description: string;
    duration: string;
    instructor: string;
    language: string;
    level: string;
    status: string;
    title: string;
    xp: number;
}

function toPayload(data: CourseInput): AdminCoursePayload {
    return {
        title: data.title,
        description: data.description,
        language: data.language,
        level: data.level,
        duration: data.duration,
        xp: Number(data.xp),
        instructor: data.instructor,
        banner: data.banner || undefined,
        color: "primary",
        status: data.status,
    };
}

export function useAdminCourses() {
    const queryClient = useQueryClient();

    const coursesQuery = useQuery({
        queryKey: ["admin-courses"],
        queryFn: () => apiFetch<CoursesResponse>("/api/courses"),
    });

    const createCourse = useMutation({
        mutationFn: (data: CourseInput) =>
            apiFetch<CourseResponse>("/api/admin/courses", {
                method: "POST",
                body: JSON.stringify(toPayload(data)),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
    });

    const updateCourse = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CourseInput }) =>
            apiFetch<CourseResponse>(`/api/admin/courses/${id}`, {
                method: "PATCH",
                body: JSON.stringify(toPayload(data)),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
    });

    const deleteCourse = useMutation({
        mutationFn: (id: string) =>
            apiFetch<{ message: string }>(`/api/admin/courses/${id}`, {
                method: "DELETE",
                body: JSON.stringify({})
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
    });

    return {
        courses: coursesQuery.data?.courses ?? [],
        isLoading: coursesQuery.isLoading,
        isError: coursesQuery.isError,
        error: coursesQuery.error,

        createCourse,
        updateCourse,
        deleteCourse,
    };
}
