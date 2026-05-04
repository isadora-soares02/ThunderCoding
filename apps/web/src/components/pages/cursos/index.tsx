/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
"use client";

import { useState } from "react";
import { CourseCard } from "@/components/cards/course-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCourses } from "@/hooks/use-courses";
import { cn } from "@/lib/utils";

const filtros = [
    "Todos",
    "Iniciante",
    "Intermediário",
    "Avançado",
    "TypeScript",
    "Java",
    "C",
    "Algoritmos",
] as const;

export function CoursesPage() {
    const [filtro, setFiltro] = useState<(typeof filtros)[number]>("Todos");

    const { data, isLoading, isError, error } = useCourses({
        level: ["Iniciante", "Intermediário", "Avançado"].includes(filtro)
            ? filtro
            : undefined,
        language: ["Todos", "Iniciante", "Intermediário", "Avançado"].includes(filtro)
            ? undefined
            : filtro,
    });

    const cursos = data?.courses ?? [];

    if (isLoading) {
        return <CoursesSkeleton />;
    }

    if (isError) {
        return <p className="text-destructive text-sm">{error.message}</p>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-3xl">Cursos</h1>
                <p className="text-muted-foreground">
                    Escolha um tema e comece sua próxima aventura.
                </p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {filtros.map((f) => (
                    <Button
                        className={cn("shrink-0 rounded-full", filtro === f && "shadow-glow")}
                        key={f}
                        onClick={() => setFiltro(f)}
                        size="sm"
                        variant={filtro === f ? "default" : "outline"}
                    >
                        {f}
                    </Button>
                ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cursos.map((c) => (
                    <CourseCard course={c} key={c.id} />
                ))}
            </div>
        </div>
    );
}

function CoursesSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="space-y-2">
                <div className="h-9 w-32 rounded-xl bg-muted" />
                <div className="h-5 w-80 max-w-full rounded bg-muted" />
            </div>

            <div className="flex gap-2 overflow-hidden pb-1">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        className="h-9 w-24 shrink-0 rounded-full bg-muted"
                        key={i}
                    />
                ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card className="h-56 rounded-2xl bg-muted" key={i} />
                ))}
            </div>
        </div>
    );
}