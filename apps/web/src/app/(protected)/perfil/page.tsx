"use client";

import { Pencil } from "lucide-react";
import { LevelBadge } from "@/components/badges/level-badge";
import { StreakBadge } from "@/components/badges/streak-badge";
import { XPBadge } from "@/components/badges/xp-badge";
import { AchievementCard } from "@/components/cards/achievement-card";
import { ProgressBar } from "@/components/progress-bar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProfile, useProfileTrails } from "@/hooks/use-profile";

export default function Profile() {
    const profileQuery = useProfile();
    const trailsQuery = useProfileTrails();

    if (profileQuery.isLoading || trailsQuery.isLoading) {
        return (
            <p className="text-muted-foreground text-sm">Carregando perfil...</p>
        );
    }

    if (profileQuery.isError) {
        return (
            <p className="text-destructive text-sm">{profileQuery.error.message}</p>
        );
    }

    const user = profileQuery.data?.user;

    if (!user) {
        return null;
    }

    const achievements = profileQuery.data?.achievements ?? [];
    const courses = profileQuery.data?.courses ?? [];
    const trails = trailsQuery.data?.trails ?? [];

    const medalhas = achievements.filter((a) => a.unlocked);
    const concluidos = courses.filter((c) => c.progress === 100);

    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("");

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden">
                <div className="h-28 bg-gradient-hero" />

                <div className="-mt-12 px-5 pb-6 sm:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex items-end gap-4">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-card">
                                <AvatarFallback className="bg-gradient-primary font-bold text-2xl text-primary-foreground">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <h1 className="font-display text-2xl">{user.name}</h1>
                                <p className="text-muted-foreground text-sm">{user.email}</p>
                            </div>
                        </div>

                        <Button variant="outline">
                            <Pencil size={14} /> Editar perfil
                        </Button>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <LevelBadge nivel={user.level} />
                        <XPBadge xp={user.xp} />
                        <StreakBadge dias={user.streak} />
                    </div>

                    <div className="mt-5">
                        <div className="flex justify-between text-sm">
                            <span>Progresso para o nível {user.level + 1}</span>
                            <span className="text-muted-foreground">
                                {user.currentXp}/{user.xpPerLevel} XP
                            </span>
                        </div>

                        <ProgressBar
                            className="mt-2 h-2.5"
                            gradient
                            value={user.levelProgressPercentage}
                        />
                    </div>
                </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Cursos concluídos" value={String(concluidos.length)} />
                <StatCard label="Medalhas" value={String(medalhas.length)} />
                <StatCard label="XP total" value={user.xp.toLocaleString("pt-BR")} />
            </div>

            <section>
                <h2 className="mb-3 font-display text-xl">Progresso por trilha</h2>

                <div className="space-y-3">
                    {trails.map((t) => (
                        <Card className="p-4" key={t.id}>
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold">{t.name}</span>
                                <span className="text-muted-foreground">{t.progress}%</span>
                            </div>

                            <ProgressBar className="mt-2" gradient value={t.progress} />
                        </Card>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="mb-3 font-display text-xl">Medalhas conquistadas</h2>

                <div className="grid gap-3 md:grid-cols-2">
                    {medalhas.map((a) => (
                        <AchievementCard achievement={a} key={a.id} />
                    ))}
                </div>
            </section>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <Card className="p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wider">
                {label}
            </p>
            <p className="mt-1 font-display text-2xl">{value}</p>
        </Card>
    );
}
