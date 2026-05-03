"use client"

import { ArrowRight, Flame, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import { XPBadge } from "@/components/badges/xp-badge";
import { AchievementCard } from "@/components/cards/achievement-card";
import { CourseCard } from "@/components/cards/course-card";
import { TrailCard } from "@/components/cards/trail-card";
import { ProgressBar } from "@/components/progress-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDashboard } from "@/hooks/use-dashboard";
import { useSession } from "@/lib/auth-client";
import { xpToNextLevel } from "@/lib/utils";

export default function Dashboard() {
    const { data, isLoading, isError, error } = useDashboard();

    console.log(data)

    const { data: session } = useSession();

    const user = session?.user;
    if (!user) {
        return null;
    }

    if (isLoading) {
        return (
            <p className="text-muted-foreground text-sm">Carregando dashboard...</p>
        );
    }

    if (isError) {
        return <p className="text-destructive text-sm">{error.message}</p>;
    }

    if (!data) {
        return null;
    }

    const { level, currentXp, xpPerLevel, percentage } = xpToNextLevel(user.xp);
    // const proximaAula = undefined; // vamos buscar no detalhe do curso depois
    const cursoEmAndamento = data.coursesInProgress?.[0];
    const recentAchievements = data.recentAchievements ?? [];
    const trilhasDestaque = data.recommendedTrails?.slice(0, 2) ?? [];
    const cursosDestaque = data.recommendedCourses?.slice(0, 3) ?? [];

    return (
        <div className="space-y-8">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-card sm:p-8">
                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-semibold text-xs backdrop-blur">
                            <Sparkles size={12} /> Bom te ver de volta
                        </span>
                        <h1 className="font-display text-3xl sm:text-4xl">
                            Olá, {user.name.split(" ")[0]}! Pronto para codar hoje?
                        </h1>
                        <p className="max-w-md opacity-90">
                            Você está a {xpPerLevel - currentXp} XP de subir para o nível{" "}
                            {level + 1}. Vamos lá!
                        </p>
                    </div>
                    {cursoEmAndamento && (
                        <Button
                            asChild
                            className="shrink-0 bg-white text-primary hover:bg-white/90"
                            size="lg"
                            variant="secondary"
                        >
                            <Link href={`/cursos/${cursoEmAndamento.id}`}>
                                Continuar aprendendo <ArrowRight size={18} />
                            </Link>
                        </Button>
                    )}
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

            {/* Progress to next level */}
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

            {/* Continue + next lesson
            {cursoEmAndamento && proximaAula && (
                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-display text-xl">Continue de onde parou</h2>
                    </div>
                    <Card className="bg-gradient-card p-5 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                                <PlayCircle size={26} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-muted-foreground text-xs uppercase tracking-wider">
                                    {cursoEmAndamento.title}
                                </p>
                                <h3 className="truncate font-display text-lg leading-tight">
                                    Próxima aula: {proximaAula.title}
                                </h3>
                                <div className="mt-2 max-w-md space-y-1">
                                    <ProgressBar gradient value={cursoEmAndamento.progresso} />
                                    <p className="text-muted-foreground text-xs">
                                        {cursoEmAndamento.progresso}% concluído
                                    </p>
                                </div>
                            </div>
                            <Button asChild className="shrink-0">
                                <Link href={`/aulas/${proximaAula.id}`}>
                                    Continuar <ArrowRight size={16} />
                                </Link>
                            </Button>
                        </div>
                    </Card>
                </section>
            )} */}

            {/* Trilhas destaque */}
            <section>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-display text-xl">Trilhas em destaque</h2>
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

            {/* Cursos em destaque */}
            <section>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-display text-xl">Cursos para você</h2>
                    <Button asChild size="sm" variant="ghost">
                        <Link href="/cursos">
                            Ver todos <ArrowRight size={14} />
                        </Link>
                    </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cursosDestaque.slice(0, 3).map((c) => (
                        <CourseCard course={c} key={c.id} />
                    ))}
                </div>
            </section>

            {/* Conquistas recentes */}
            <section>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-display text-xl">
                        <Trophy className="text-accent" size={20} /> Conquistas recentes
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
            <p className="mt-1 font-display text-xl">{value}</p>
        </div>
    );
}
