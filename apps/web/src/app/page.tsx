import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="mb-2 text-sm font-medium text-cyan-700">ThunderCoding</p>
        <h1 className="text-3xl font-bold tracking-tight">
          Frontend base pronto para começar
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Esta base já inclui layout, integração com a API, cliente de
          autenticação e uma página de exemplo consumindo o backend.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/example"
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white"
          >
            Ver página de exemplo
          </Link>

          <Link
            href="/auth"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800"
          >
            Ver exemplo de auth
          </Link>
        </div>
      </div>
    </section>
  );
}