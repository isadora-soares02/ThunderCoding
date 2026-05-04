import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function XPBadge({
    xp,
    className,
    size = "md",
}: {
    xp: number;
    className?: string;
    size?: "sm" | "md" | "lg";
}) {
    const sizes = {
        sm: "text-xs px-2 py-0.5 gap-1",
        md: "text-sm px-2.5 py-1 gap-1.5",
        lg: "text-base px-3 py-1.5 gap-2",
    };
    const icon = { sm: 12, md: 14, lg: 16 }[size];
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full bg-gradient-xp font-semibold text-accent-foreground shadow-xp",
                sizes[size],
                className
            )}
        >
            <Zap className="fill-current" size={icon} />
            {xp.toLocaleString("pt-BR")} XP
        </span>
    );
}
