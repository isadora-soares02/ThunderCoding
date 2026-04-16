import { ReactNode } from "react";
import { AppHeader } from "./app-header";

/**
 * Shell principal da aplicação.
 *
 * Pode evoluir isso depois para:
 * - sidebar
 * - breadcrumb
 * - footer
 * - área autenticada
 */
export function AppShell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <AppHeader />

            <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
    );
}