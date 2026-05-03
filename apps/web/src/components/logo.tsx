import { cn } from "@/lib/utils";

export function Logo({
    className,
    showWord = true,
}: {
    className?: string;
    showWord?: boolean;
}) {
    return (
        <div className={cn("inline-flex items-center justify-center", className)}>
            {showWord ? (
                <img alt="ThunderCoding" className="h-20 w-auto" src="/logo.png" />
            ) : (
                <img
                    alt="ThunderCoding"
                    className="h-9 w-9 object-contain"
                    src="/icon.png"
                />
            )}
        </div>
    );
}
