import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
    title,
    description,
    icon: Icon = Inbox,
    action,
}: {
    title: string;
    description?: string;
    icon?: typeof Inbox;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card/50 p-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <Icon size={24} />
            </div>
            <div>
                <h3 className="font-semibold">{title}</h3>
                {description && (
                    <p className="mt-1 text-muted-foreground text-sm">{description}</p>
                )}
            </div>
            {action}
        </div>
    );
}
