import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";

export interface AdminStatsResponse {
    latestUpdates: {
        type: "Course" | "Question" | string;
        title: string;
        date: string;
    }[];
    mostAccessedCourses: {
        title: string;
        accesses: number;
    }[];
    totalAchievements: number;
    totalCourses: number;
    totalLessons: number;
    totalQuestions: number;
    totalTrails: number;
    totalUsers: number;
}

export function useAdminStats() {
    const query = useQuery({
        queryKey: ["admin-stats"],
        queryFn: () => apiFetch<AdminStatsResponse>("/api/admin/stats"),
    });

    return {
        stats: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
    };
}
