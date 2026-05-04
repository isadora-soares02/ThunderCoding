import { LayoutDashboard, BookOpen, Compass, GraduationCap, HelpCircle, Trophy, ArrowLeft, LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items = [
    { to: "/admin", label: "Visão geral", icon: LayoutDashboard, end: true },
    { to: "/admin/cursos", label: "Cursos", icon: BookOpen },
    { to: "/admin/trilhas", label: "Trilhas", icon: Compass },
    { to: "/admin/aulas", label: "Aulas", icon: GraduationCap },
    { to: "/admin/perguntas", label: "Perguntas", icon: HelpCircle },
    { to: "/admin/conquistas", label: "Conquistas", icon: Trophy },
];

export function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    if (!user) return null;

    return (
        <div className="flex min-h-screen w-full bg-muted/40">
            <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-card p-4 gap-2 sticky top-0 h-screen">
                <Logo />
                <p className="px-2 mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</p>
                <nav className="mt-3 flex flex-col gap-1">
                    {items.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-smooth",
                                    isActive ? "bg-primary text-primary-foreground shadow-glow" : "hover:bg-muted"
                                )
                            }
                        >
                            <item.icon size={18} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="mt-auto flex flex-col gap-1">
                    <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                        <ArrowLeft size={14} /> Voltar ao app
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/login"); }}>
                        <LogOut size={14} /> Sair
                    </Button>
                </div>
            </aside>
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-card/80 px-4 py-3 backdrop-blur md:px-8">
                    <div className="md:hidden"><Logo showWord={false} /></div>
                    <div>
                        <p className="text-xs text-muted-foreground">Painel administrativo</p>
                        <p className="font-semibold">ThunderCoding</p>
                    </div>
                    <div className="ml-auto md:hidden flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}><ArrowLeft size={14} /></Button>
                    </div>
                </header>
                {/* Mobile tabs */}
                <nav className="md:hidden flex overflow-x-auto gap-1 border-b bg-card px-3 py-2">
                    {items.map((i) => (
                        <NavLink
                            key={i.to}
                            to={i.to}
                            end={i.end}
                            className={({ isActive }) =>
                                cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-medium", isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")
                            }
                        >
                            {i.label}
                        </NavLink>
                    ))}
                </nav>
                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
