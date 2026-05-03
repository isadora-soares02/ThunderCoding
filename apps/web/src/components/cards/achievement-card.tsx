import {
    Brain,
    Bug,
    Code2,
    Compass,
    Flame,
    Lock,
    type LucideIcon,
    Trophy,
} from "lucide-react";
import { ProgressBar } from "@/components/progress-bar";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/types";

const iconMap: Record<string, LucideIcon> = {
    Code2,
    Brain,
    Flame,
    Compass,
    Bug,
    Trophy,
};

export function AchievementCard({ achievement }: { achievement: Achievement }) {
    const Icon = iconMap[achievement.icon] || Trophy;
    const locked = !achievement.unlocked;
    return (
        <article
            className={cn(
                "group flex gap-4 rounded-2xl border bg-card p-4 shadow-soft transition-smooth hover:shadow-card",
                locked && "opacity-90"
            )}
        >
            <div
                className={cn(
                    "grid h-14 w-14 shrink-0 place-items-center rounded-2xl",
                    locked
                        ? "bg-muted text-muted-foreground"
                        : "animate-pop-in bg-gradient-xp text-accent-foreground shadow-xp"
                )}
            >
                {locked ? <Lock size={20} /> : <Icon size={22} />}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold leading-tight">{achievement.name}</h4>
                    <span className="font-bold text-accent text-xs">
                        +{achievement.xpBonus} XP
                    </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-muted-foreground text-sm">
                    {achievement.description}
                </p>
                {locked && achievement.progress !== undefined && (
                    <div className="mt-2 space-y-1">
                        <ProgressBar value={achievement.progress} />
                        <p className="text-muted-foreground text-xs">
                            {achievement.progress}% — {achievement.criterion}
                        </p>
                    </div>
                )}
            </div>
        </article>
    );
}
