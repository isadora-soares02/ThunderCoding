"use client";

import { Trophy } from "lucide-react";
import { AchievementCard } from "@/components/cards/achievement-card";
import { Card } from "@/components/ui/card";
import { useAchievements } from "@/hooks/use-achievements";

export default function Achievements() {
    const { data, isLoading, isError, error } = useAchievements();

    if (isLoading) {
        return (
            <p className="text-muted-foreground text-sm">Carregando conquistas...</p>
        );
    }

    if (isError) {
        return <p className="text-destructive text-sm">{error.message}</p>;
    }

    const achievements = data?.achievements ?? [];

    const desbloqueadas = achievements.filter((a) => a.unlocked);
    const bloqueadas = achievements.filter((a) => !a.unlocked);
    const total = achievements.length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="font-display text-3xl">Conquistas</h1>
                <p className="text-muted-foreground">
                    Desbloqueie sua próxima conquista e ganhe XP bônus.
                </p>
            </div>

            <Card className="flex items-center gap-4 bg-gradient-card p-5">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-xp text-accent-foreground shadow-xp">
                    <Trophy size={24} />
                </div>
                <div>
                    <p className="font-display text-2xl">
                        {desbloqueadas.length}{" "}
                        <span className="text-base text-muted-foreground">/ {total}</span>
                    </p>
                    <p className="text-muted-foreground text-sm">
                        conquistas desbloqueadas
                    </p>
                </div>
            </Card>

            <section>
                <h2 className="mb-3 font-display text-lg">Desbloqueadas</h2>
                <div className="grid gap-3 md:grid-cols-2">
                    {desbloqueadas.map((a) => (
                        <AchievementCard achievement={a} key={a.id} />
                    ))}
                </div>
            </section>

            <section>
                <h2 className="mb-3 font-display text-lg">Em progresso</h2>
                <div className="grid gap-3 md:grid-cols-2">
                    {bloqueadas.map((a) => (
                        <AchievementCard achievement={a} key={a.id} />
                    ))}
                </div>
            </section>
        </div>
    );
}
