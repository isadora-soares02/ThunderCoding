import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import type { Trail } from "@/types";

interface TrailsResponse {
    trails: Trail[];
}

export function useTrails() {
    return useQuery({
        queryKey: ["trails"],
        queryFn: () => apiFetch<TrailsResponse>("/api/trails"),
    });
}
