"use client"

import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { XPBadge } from "@/components/badges/xp-badge";
import { CourseCard } from "@/components/cards/course-card";
import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTrailDetail } from "@/hooks/use-trail-detail";

export default function TrailDetail() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const { data, isLoading, isError, error } = useTrailDetail(id);

    if (isLoading) {
        return (
            <p className="text-muted-foreground text-sm">Carregando trilha...</p>
        );
    }

    if (isError) {
        return <p className="text-destructive text-sm">{error.message}</p>;
    }

    const trail = data?.trail;

    if (!trail) {
        return (
            <EmptyState
                action={
                    <Button asChild>
                        <Link href="/trilhas">Ver trilhas</Link>
                    </Button>
                }
                icon={Compass}
                title="Trilha não encontrada"
            />
        );
    }

    const cursos = trail.courses ?? [];

    return (
        <div className="space-y-6">
            <Button asChild size="sm" variant="ghost">
                <Link href="/trilhas">
                    <ArrowLeft size={16} /> Voltar
                </Link>
            </Button>

            <Card className="overflow-hidden">
                <div className="h-32 bg-gradient-hero" />

                <div className="space-y-4 p-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{trail.level}</Badge>

                        <XPBadge size="sm" xp={trail.totalXp} />
                    </div>

                    <h1 className="font-display text-3xl">{trail.name}</h1>

                    <p className="text-muted-foreground">{trail.description}</p>

                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span className="font-semibold">{trail.progress}%</span>
                        </div>

                        <ProgressBar gradient value={trail.progress} />
                    </div>

                    <Button className="shadow-glow" size="lg">
                        Começar trilha
                    </Button>
                </div>
            </Card>

            <section>
                <h2 className="mb-3 font-display text-xl">Cursos da trilha</h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cursos.map((c) => (
                        <CourseCard course={c} key={c.id} />
                    ))}
                </div>
            </section>
        </div>
    );
}
