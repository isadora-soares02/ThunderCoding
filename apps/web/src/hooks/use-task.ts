import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import type { Task } from "@/types";

interface TaskResponse {
    task: Task & {
        completed?: boolean;
        answer?: string;
    };
}

interface SubmitTaskResponse {
    completed: boolean;
    conquistasDesbloqueadas: string[];
    level: number;
    message: string;
    xpEarned: number;
}

export function useTask(id?: string) {
    return useQuery({
        queryKey: ["task", id],
        queryFn: () => apiFetch<TaskResponse>(`/api/tasks/${id}`),
        enabled: !!id,
    });
}

export function useSubmitTask(id?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (answer: string) =>
            apiFetch<SubmitTaskResponse>(`/api/tasks/${id}/submit`, {
                method: "POST",
                body: JSON.stringify({ answer }),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["task", id] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["achievements"] });
            queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
    });
}
