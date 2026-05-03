import { Brain, Compass, Globe, type LucideIcon, Sparkles } from "lucide-react";
import Link from "next/link";
import { XPBadge } from "@/components/badges/xp-badge";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Trail } from "@/types";

const iconMap: Record<string, LucideIcon> = { Brain, Compass, Globe, Sparkles };

export function TrailCard({ trail }: { trail: Trail }) {
    const Icon = iconMap[trail.icon] || Sparkles;
    return (
        <article className="group flex flex-col gap-4 rounded-2xl border bg-gradient-card p-5 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-card">
            <div className="flex items-start justify-between gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                    <Icon size={22} />
                </div>
                <XPBadge size="sm" xp={trail.totalXp} />
            </div>
            <div>
                <Badge className="mb-2" variant="outline">
                    {trail.level}
                </Badge>
                <h3 className="font-display text-xl leading-tight">{trail.name}</h3>
                <p className="mt-1 text-muted-foreground text-sm">{trail.description}</p>
            </div>
            <div className="text-muted-foreground text-xs">
                {trail.courseIds.length} cursos
            </div>
            <div className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-semibold">{trail.progress}%</span>
                </div>
                <ProgressBar gradient value={trail.progress} />
            </div>
            <Button asChild className="mt-auto" variant="outline">
                <Link href={`/trilhas/${trail.id}`}>Ver trilha</Link>
            </Button>
        </article>
    );
}
