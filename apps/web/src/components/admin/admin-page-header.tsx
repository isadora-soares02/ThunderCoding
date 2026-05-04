import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function AdminPageHeader({
    title,
    description,
    actionLabel,
    onAction,
    children,
}: {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    children?: ReactNode;
}) {
    return (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 className="font-display text-3xl">{title}</h1>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            <div className="flex gap-2">
                {children}
                {actionLabel && onAction && (
                    <Button className="shadow-glow" onClick={onAction}>
                        <Plus size={16} /> {actionLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}
