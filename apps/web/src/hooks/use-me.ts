"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";

interface User {
    avatarUrl?: string;
    completedCourses: number;
    currentXp: number;
    email: string;
    id: string;
    isAdmin: boolean;
    level: number;
    levelProgressPercentage: number;
    name: string;
    role: "ADMIN" | "USER";
    streak: number;
    xp: number;
    xpPerLevel: number;
}

interface MeResponse {
    user: User;
}

export function useMe() {
    return useQuery<MeResponse>({
        queryKey: ["me"],
        queryFn: () => apiFetch<MeResponse>("/api/me"),
    });
}
