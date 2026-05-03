"use client"

import { useState } from "react";
import { CourseCard } from "@/components/cards/course-card";
import { Button } from "@/components/ui/button";
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

export default function Courses() {
    const [filtro, setFiltro] = useState<(typeof filtros)[number]>("Todos");

    const { data, isLoading, isError, error } = useCourses({
        level: ["Iniciante", "Intermediário", "Avançado"].includes(filtro)
            ? filtro
            : undefined,
        language: ["Todos", "Iniciante", "Intermediário", "Avançado"].includes(
            filtro
        )
            ? undefined
            : filtro,
    });

    const cursos = data?.courses ?? [];

    if (isLoading) {
        return (
            <p className="text-muted-foreground text-sm">Carregando cursos...</p>
        );
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
                        className={cn(
                            "shrink-0 rounded-full",
                            filtro === f && "shadow-glow"
                        )}
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
