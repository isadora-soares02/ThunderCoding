/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
"use client";

import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { XPBadge } from "@/components/badges/xp-badge";
import { CourseCard } from "@/components/cards/course-card";
import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTrailDetail } from "@/hooks/use-trail-detail";

export function TrailDetail({ id }: { id: string }) {
    const router = useRouter();

    const { data, isLoading, isError, error } = useTrailDetail(id);

    if (isLoading) {
        return <TrailDetailSkeleton />;
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
            <Button
                className="cursor-pointer"
                onClick={() => {
                    if (window.history.length > 1) {
                        router.back();
                    } else {
                        router.push("/trilhas");
                    }
                }}
                size="sm"
                variant="ghost"
            >
                <ArrowLeft size={16} /> Voltar
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

function TrailDetailSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="h-8 w-24 rounded bg-muted" />

            <Card className="overflow-hidden">
                <div className="h-32 bg-muted" />

                <div className="space-y-4 p-6">
                    <div className="flex gap-2">
                        <div className="h-6 w-20 rounded-full bg-muted" />
                        <div className="h-6 w-16 rounded-full bg-muted" />
                    </div>

                    <div className="h-8 w-64 rounded bg-muted" />

                    <div className="h-4 w-full max-w-lg rounded bg-muted" />
                    <div className="h-4 w-3/4 rounded bg-muted" />

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <div className="h-4 w-20 rounded bg-muted" />
                            <div className="h-4 w-10 rounded bg-muted" />
                        </div>

                        <div className="h-3 w-full rounded-full bg-muted" />
                    </div>

                    <div className="h-12 w-48 rounded-xl bg-muted" />
                </div>
            </Card>

            <section>
                <div className="mb-3 h-6 w-48 rounded bg-muted" />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card className="h-56 rounded-2xl bg-muted" key={i} />
                    ))}
                </div>
            </section>
        </div>
    );
}