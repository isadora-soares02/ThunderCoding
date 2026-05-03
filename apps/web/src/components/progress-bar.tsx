import { cn } from "@/lib/utils";

export function ProgressBar({ value, className, gradient = false }: { value: number; className?: string; gradient?: boolean }) {
    const pct = Math.max(0, Math.min(100, value));
    return (
        <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
            <div
                className={cn("h-full rounded-full transition-all duration-500", gradient ? "bg-gradient-primary" : "bg-primary")}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}
