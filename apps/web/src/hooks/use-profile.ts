import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import type { Achievement, Course, Trail, User } from "@/types";

interface ProfileUser extends User {
    currentXp: number;
    levelProgressPercentage: number;
    xpPerLevel: number;
}

interface ProfileResponse {
    achievements: Achievement[];
    courses: Course[];
    user: ProfileUser;
}

interface TrailsResponse {
    trails: Trail[];
}

export function useProfile() {
    return useQuery({
        queryKey: ["profile"],
        queryFn: () => apiFetch<ProfileResponse>("/api/profile"),
    });
}

export function useProfileTrails() {
    return useQuery({
        queryKey: ["profile-trails"],
        queryFn: () => apiFetch<TrailsResponse>("/api/trails"),
    });
}
