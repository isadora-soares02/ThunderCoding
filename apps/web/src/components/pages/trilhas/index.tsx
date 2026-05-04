/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
"use client";

import { TrailCard } from "@/components/cards/trail-card";
import { Card } from "@/components/ui/card";
import { useTrails } from "@/hooks/use-trails";

export function TrailsPage() {
    const { data, isLoading, isError, error } = useTrails();

    if (isLoading) {
        return <TrailsSkeleton />;
    }

    if (isError) {
        return <p className="text-destructive text-sm">{error.message}</p>;
    }

    const trails = data?.trails ?? [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-3xl">Trilhas de aprendizado</h1>
                <p className="text-muted-foreground">
                    Caminhos guiados para você dominar uma área.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {trails.map((t) => (
                    <TrailCard key={t.id} trail={t} />
                ))}
            </div>
        </div>
    );
}

function TrailsSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="space-y-2">
                <div className="h-9 w-72 rounded-xl bg-muted" />
                <div className="h-5 w-96 max-w-full rounded bg-muted" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card className="h-56 rounded-2xl bg-muted" key={i} />
                ))}
            </div>
        </div>
    );
}