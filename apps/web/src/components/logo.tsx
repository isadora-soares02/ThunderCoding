import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
    className,
    showWord = true,
}: {
    className?: string;
    showWord?: boolean;
}) {
    return (
        <div className={cn("inline-flex items-center gap-2", className)}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Zap className="fill-current" size={18} />
            </span>
            {showWord && (
                <span className="font-bold font-display text-lg tracking-tight">
                    Thunder<span className="text-primary">Coding</span>
                </span>
            )}
        </div>
    );
}
