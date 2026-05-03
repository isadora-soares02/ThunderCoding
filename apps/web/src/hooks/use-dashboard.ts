"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import type { Achievement, Course, Trail, User } from "@/types";

export interface DashboardResponse {
    coursesInProgress: Course[];
    recentAchievements: Achievement[];
    recommendedTrails: Trail[];
    resume: {
        totalCourses: number;
        completedCourses: number;
        cousesInProgress: number;
    };
    user: User & {
        currentXp: number;
        xpPerLevel: number;
        levelProgressPercentage: number;
    };
}

export function useDashboard() {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: () => apiFetch<DashboardResponse>("/api/dashboard"),
    });
}
