/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
"use client";

import { ArrowRight, Flame, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import { XPBadge } from "@/components/badges/xp-badge";
import { AchievementCard } from "@/components/cards/achievement-card";
import { TrailCard } from "@/components/cards/trail-card";
import { ProgressBar } from "@/components/progress-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDashboard } from "@/hooks/use-dashboard";
import { xpToNextLevel } from "@/lib/utils";

export function DashboardPage() {
    const { data, isLoading, isError, error } = useDashboard();

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (isError) {
        return <p className="text-destructive text-sm"> {error.message} </p>;
    }

    if (!data) {
        return null;
    }

    const user = data.user;

    const { level, currentXp, xpPerLevel, percentage } = xpToNextLevel(user.xp);
    const recentAchievements = data.recentAchievements ?? [];
    const trilhasDestaque = data.recommendedTrails?.slice(0, 2) ?? [];

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-card sm:p-8">
                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-semibold text-xs backdrop-blur">
                            <Sparkles size={12} /> Bom te ver de volta
                        </span>

                        <h1 className="font-display text-3xl sm:text-4xl">
                            Olá, {user.name.split(" ")[0]}! Pronto para codar hoje ?
                        </h1>

                        <p className="max-w-md opacity-90">
                            Você está a {xpPerLevel - currentXp} XP de subir para o nível{" "}
                            {level + 1}. Vamos lá!
                        </p>
                    </div>
                </div>

                <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatCard label="XP total" value={user.xp.toLocaleString("pt-BR")} />

                    <StatCard label="Nível" value={String(user.level)} />

                    <StatCard
                        icon={<Flame className="fill-current" size={14} />}
                        label="Streak"
                        value={`${user.streak} dias`}
                    />

                    <StatCard label="Cursos" value={String(user.completedCourses)} />
                </div>
            </section>

            <Card className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-display text-lg">
                            Progresso para o nível {level + 1}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Cada XP conta. Continue assim!
                        </p>
                    </div>
                    <XPBadge xp={currentXp} />
                </div>
                <ProgressBar className="mt-4 h-3" gradient value={percentage} />
                <p className="mt-2 text-muted-foreground text-xs">
                    {currentXp} / {xpPerLevel} XP
                </p>
            </Card>

            <section>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-display text-xl"> Trilhas em Destaque </h2>

                    <Button asChild size="sm" variant="ghost">
                        <Link href="/trilhas">
                            Ver todas <ArrowRight size={14} />
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {trilhasDestaque.map((t) => (
                        <TrailCard key={t.id} trail={t} />
                    ))}
                </div>
            </section>

            <section>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-display text-xl"> Cursos para Você </h2>

                    <Button asChild size="sm" variant="ghost">
                        <Link href="/cursos">
                            Ver todos <ArrowRight size={14} />
                        </Link>
                    </Button>
                </div>
            </section>

            <section>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-display text-xl">
                        <Trophy className="text-accent" size={20} /> Conquistas Recentes
                    </h2>

                    <Button asChild size="sm" variant="ghost">
                        <Link href="/conquistas">
                            Ver minhas conquistas <ArrowRight size={14} />
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    {recentAchievements.map((a) => (
                        <AchievementCard achievement={a} key={a.id} />
                    ))}
                </div>
            </section>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
            <p className="inline-flex items-center gap-1 text-xs opacity-90">
                {icon} {label}
            </p>
            <p className="mt-1 font-display text-xl"> {value} </p>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="animate-pulse space-y-8">
            <section className="rounded-3xl bg-muted p-6 shadow-card sm:p-8">
                <div className="h-6 w-32 rounded-full bg-muted-foreground/20" />
                <div className="mt-4 h-10 w-3/4 rounded-xl bg-muted-foreground/20" />
                <div className="mt-3 h-4 w-1/2 rounded bg-muted-foreground/20" />

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div className="h-20 rounded-2xl bg-muted-foreground/20" key={i} />
                    ))}
                </div>
            </section>

            <Card className="p-5 sm:p-6">
                <div className="flex justify-between">
                    <div className="space-y-2">
                        <div className="h-6 w-48 rounded bg-muted" />
                        <div className="h-4 w-64 rounded bg-muted" />
                    </div>
                    <div className="h-8 w-20 rounded-full bg-muted" />
                </div>
                <div className="mt-4 h-3 rounded-full bg-muted" />
            </Card>

            <section>
                <div className="mb-3 h-7 w-48 rounded bg-muted" />
                <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Card className="h-40 rounded-2xl bg-muted" key={i} />
                    ))}
                </div>
            </section>

            <section>
                <div className="mb-3 h-7 w-44 rounded bg-muted" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card className="h-56 rounded-2xl bg-muted" key={i} />
                    ))}
                </div>
            </section>

            <section>
                <div className="mb-3 h-7 w-56 rounded bg-muted" />
                <div className="grid gap-3 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card className="h-28 rounded-2xl bg-muted" key={i} />
                    ))}
                </div>
            </section>
        </div>
    );
}
