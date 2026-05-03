import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function StreakBadge({
    dias,
    className,
}: {
    dias: number;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-gradient-streak px-3 py-1 font-semibold text-sm text-streak-foreground",
                className
            )}
        >
            <Flame className="fill-current" size={14} />
            {dias} {dias === 1 ? "dia" : "dias"}
        </span>
    );
}
