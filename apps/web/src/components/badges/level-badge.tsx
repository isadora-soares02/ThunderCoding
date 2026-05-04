import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export function LevelBadge({
    nivel,
    className,
}: {
    nivel: number;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-3 py-1 font-semibold text-primary-foreground text-sm shadow-glow",
                className
            )}
        >
            <Trophy size={14} />
            Nível {nivel}
        </span>
    );
}
