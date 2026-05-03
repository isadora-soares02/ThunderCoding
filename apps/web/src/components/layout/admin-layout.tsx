import {
    ArrowLeft,
    BookOpen,
    Compass,
    GraduationCap,
    HelpCircle,
    LayoutDashboard,
    LogOut,
    Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";
import { Logo } from "../Logo";
import { NavLink } from "../navlink";

const items = [
    { to: "/admin", label: "Visão Geral", icon: LayoutDashboard, end: true },
    { to: "/admin/cursos", label: "Cursos", icon: BookOpen },
    { to: "/admin/trilhas", label: "Trilhas", icon: Compass },
    { to: "/admin/aulas", label: "Aulas", icon: GraduationCap },
    { to: "/admin/perguntas", label: "Perguntas", icon: HelpCircle },
    { to: "/admin/conquistas", label: "Conquistas", icon: Trophy },
];

export function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { data: session } = useSession();

    if (!session?.user) {
        return null;
    }

    return (
        <div className="flex min-h-screen w-full bg-muted/40">
            <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-2 border-r bg-card p-4 md:flex">
                <Logo />
                <p className="mt-1 px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                    Admin
                </p>
                <nav className="mt-3 flex flex-col gap-1">
                    {items.map((item) => (
                        <NavLink
                            activeClassName="bg-primary text-primary-foreground shadow-glow hover:bg-primary"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-sm transition-smooth hover:bg-muted"
                            href={item.to}
                            key={item.to}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="mt-auto flex flex-col gap-1">
                    <Button
                        onClick={() => router.replace("/dashboard")}
                        size="sm"
                        variant="outline"
                    >
                        <ArrowLeft size={14} /> Voltar ao app
                    </Button>
                    <Button
                        onClick={async () => {
                            await authClient.signOut();
                            router.replace("/login");
                        }}
                        size="sm"
                        variant="ghost"
                    >
                        <LogOut size={14} /> Sair
                    </Button>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-card/80 px-4 py-3 backdrop-blur md:px-8">
                    <div className="md:hidden">
                        <Logo showWord={false} />
                    </div>

                    <div>
                        <p className="text-muted-foreground text-xs">
                            Painel administrativo
                        </p>
                        <p className="font-semibold">ThunderCoding</p>
                    </div>

                    <div className="ml-auto flex gap-1 md:hidden">
                        <Button
                            onClick={() => router.replace("/dashboard")}
                            size="sm"
                            variant="outline"
                        >
                            <ArrowLeft size={14} />
                        </Button>
                    </div>
                </header>

                {/* Mobile tabs */}
                <nav className="flex gap-1 overflow-x-auto border-b bg-card px-3 py-2 md:hidden">
                    {items.map((i) => (
                        <NavLink
                            activeClassName="bg-primary text-primary-foreground"
                            className="shrink-0 rounded-full bg-muted px-3 py-1.5 font-medium text-muted-foreground text-xs"
                            end={i.end}
                            href={i.to}
                            key={i.to}
                        >
                            {i.label}
                        </NavLink>
                    ))}
                </nav>

                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
            </div>
        </div>
    );
}
