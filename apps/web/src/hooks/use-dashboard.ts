"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import type { DashboardResponse } from "@/types/api";

export function useDashboard() {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: () => apiFetch<DashboardResponse>("/api/dashboard"),
    });
}
