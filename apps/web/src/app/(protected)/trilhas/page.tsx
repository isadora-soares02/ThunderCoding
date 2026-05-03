"use client";

import { TrailCard } from "@/components/cards/trail-card";
import { useTrails } from "@/hooks/use-trails";

export default function Trails() {
    const { data, isLoading, isError, error } = useTrails();

    if (isLoading) {
        return (
            <p className="text-muted-foreground text-sm">Carregando trilhas...</p>
        );
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
