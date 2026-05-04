import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import type { Course, Trail } from "@/types";

export interface TrailDetailResponse {
    trail: Trail & {
        courses?: Course[];
    };
}

export function useTrailDetail(id?: string) {
    return useQuery({
        queryKey: ["trail", id],
        queryFn: () => apiFetch<TrailDetailResponse>(`/api/trails/${id}`),
        enabled: !!id,
    });
}
