import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import type { TrailInput } from "@/schemas";
import type { Trail } from "@/types";

interface TrailsResponse {
    trails: Trail[];
}

interface TrailResponse {
    message: string;
    trail: Trail;
}

function toPayload(data: TrailInput) {
    return {
        name: data.name,
        description: data.description,
        level: data.level,
        totalXp: Number(data.totalXp),
        progress: 0,
        status: data.status,
        color: "primary",
        icon: "Sparkles",
        courseIds: [],
    };
}

export function useAdminTrails() {
    const queryClient = useQueryClient();

    const trailsQuery = useQuery({
        queryKey: ["admin-trails"],
        queryFn: () => apiFetch<TrailsResponse>("/api/trails"),
    });

    const createTrail = useMutation({
        mutationFn: (data: TrailInput) =>
            apiFetch<TrailResponse>("/api/admin/trails", {
                method: "POST",
                body: JSON.stringify(toPayload(data)),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-trails"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
    });

    const updateTrail = useMutation({
        mutationFn: ({ id, data }: { id: string; data: TrailInput }) =>
            apiFetch<TrailResponse>(`/api/admin/trails/${id}`, {
                method: "PATCH",
                body: JSON.stringify(toPayload(data)),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-trails"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
    });

    const deleteTrail = useMutation({
        mutationFn: (id: string) =>
            apiFetch<{ message: string }>(`/api/admin/trails/${id}`, {
                method: "DELETE",
                body: JSON.stringify({}),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-trails"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
    });

    return {
        trails: trailsQuery.data?.trails ?? [],
        isLoading: trailsQuery.isLoading,
        isError: trailsQuery.isError,
        error: trailsQuery.error,

        createTrail,
        updateTrail,
        deleteTrail,
    };
}
