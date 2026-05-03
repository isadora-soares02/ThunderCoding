import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import type { Achievement } from "@/types";

interface AchievementsResponse {
    achievements: Achievement[];
}

export function useAchievements() {
    return useQuery({
        queryKey: ["achievements"],
        queryFn: () => apiFetch<AchievementsResponse>("/api/achievements"),
    });
}
