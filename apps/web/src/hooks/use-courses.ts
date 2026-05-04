import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import type { Course } from "@/types";

interface CoursesResponse {
    courses: Course[];
}

interface UseCoursesParams {
    language?: string;
    level?: string;
    search?: string;
}

export function useCourses(params?: UseCoursesParams) {
    return useQuery({
        queryKey: ["courses", params],
        queryFn: () => {
            const query = new URLSearchParams();

            if (params?.level) {
                query.append("level", params.level);
            }
            if (params?.language) {
                query.append("language", params.language);
            }
            if (params?.search) {
                query.append("search", params.search);
            }

            const qs = query.toString();

            return apiFetch<CoursesResponse>(`/api/courses${qs ? `?${qs}` : ""}`);
        },
    });
}
