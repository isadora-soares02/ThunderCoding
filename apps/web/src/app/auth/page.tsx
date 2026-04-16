import { SessionStatus } from "@/components/auth/session-status";

export default function AuthExamplePage() {
    return (
        <section className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h1 className="text-2xl font-bold">Exemplo de autenticação</h1>
                <p className="mt-2 text-slate-600">
                    Esta página mostra como consultar a sessão no frontend usando o
                    Better Auth.
                </p>
            </div>

            <SessionStatus />
        </section>
    )
}