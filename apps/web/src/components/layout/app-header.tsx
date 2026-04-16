import Link from "next/link";

/**
 * Header simples.
 *
 * O objetivo aqui não é o visual final,
 * e sim mostrar a estrutura mínima de navegação do projeto.
 */
export function AppHeader() {
    return (
        <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link href="/" className="text-lg font-bold text-slate-900">
                    ThunderCoding
                </Link>

                <nav className="flex items-center gap-4 text-sm text-slate-600">
                    <Link href="/">Início</Link>
                    <Link href="/example">Exemplo</Link>
                    <Link href="/auth">Autenticação</Link>
                </nav>
            </div>
        </header>
    );
}