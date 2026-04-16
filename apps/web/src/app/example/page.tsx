import { apiFetch } from "@/lib/api-fetch";

/**
 * Esta página é um exemplo de consumo de API no App Router.
 * 
 * Como a página é um Server Component por padrão,
 * podemos fazer fetch diretamente aqui.
 * 
 * Isso é ótimo para:
 * - páginas iniciais
 * - dashboards
 * - listagens
 * - conteúdos que não dependem de interação imediata do usuário
 */
export default async function ExamplePage() {
    const health = await apiFetch("/api/health", {
        cache: "no-store"
    })

    return (
        <section className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h1 className="text-2xl font-bold">Página de Exemplo</h1>

                <p className="mt-2 text-slate-600">
                    Esta página consome uma rota pública do backend.
                </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold">Resposta de /api/health</h2>

                <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
                    {JSON.stringify(health, null, 2)}
                </pre>
            </div>
        </section>
    )
}