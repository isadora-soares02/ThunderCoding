"use client";

import {
    BookOpen,
    Compass,
    LayoutDashboard,
    LogOut,
    Shield,
    Trophy,
    User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { LevelBadge } from "@/components/badges/level-badge";
import { StreakBadge } from "@/components/badges/streak-badge";
import { XPBadge } from "@/components/badges/xp-badge";
import { Logo } from "@/components/logo";
import { NavLink } from "@/components/navlink";
import { ProgressBar } from "@/components/progress-bar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";
import { cn, xpToNextLevel } from "@/lib/utils";

const items = [
    { to: "/dashboard", label: "Início", icon: LayoutDashboard },
    { to: "/trilhas", label: "Trilhas", icon: Compass },
    { to: "/cursos", label: "Cursos", icon: BookOpen },
    { to: "/conquistas", label: "Conquistas", icon: Trophy },
    { to: "/perfil", label: "Perfil", icon: User },
];

export default function StudentLayout({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const user = session?.user;
    const router = useRouter();
    if (!user) {
        console.log("Sem user")
        return null;
    }
    const { currentXp, xpPerLevel, percentage } = xpToNextLevel(user.xp);
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("");

    return (
        <div className="flex min-h-screen w-full bg-background">
            {/* Sidebar — desktop */}
            <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-2 border-r bg-sidebar p-4 lg:flex">
                <Logo className="px-2 py-2" />

                <nav className="mt-4 flex flex-col gap-1">
                    {items.map((item) => (
                        <NavLink
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-sm transition-smooth",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                                )
                            }
                            href={item.to}
                            key={item.to}
                        >
                            <item.icon size={18} />

                            {item.label}
                        </NavLink>
                    ))}

                    {user.role === "ADMIN" && (
                        <NavLink
                            className={({ isActive }) =>
                                cn(
                                    "mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-sm transition-smooth",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-primary/10 text-primary hover:bg-primary/20"
                                )
                            }
                            href="/admin"
                        >
                            <Shield size={18} />
                            Painel Admin
                        </NavLink>
                    )}
                </nav>

                <div className="mt-auto rounded-2xl border bg-card p-3">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-sm">{user.name}</p>

                            <p className="truncate text-muted-foreground text-xs">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                            <span>Nível {user.level}</span>
                            <span className="text-muted-foreground">
                                {currentXp}/{xpPerLevel} XP
                            </span>
                        </div>
                        <ProgressBar gradient value={percentage} />
                    </div>

                    <Button
                        className="mt-3 w-full justify-start"
                        onClick={async () => {
                            await authClient.signOut();
                            router.push("/login");
                        }}
                        size="sm"
                        variant="ghost"
                    >
                        <LogOut size={16} />
                        Sair
                    </Button>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Header */}
                <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur lg:px-8">
                    <div className="lg:hidden">
                        <Logo showWord={false} />
                    </div>

                    <div className="hidden flex-col md:flex">
                        <p className="text-muted-foreground text-xs">Bem-vindo de volta</p>
                        <p className="font-semibold">{user.name.split(" ")[0]}</p>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <XPBadge className="hidden sm:inline-flex" size="sm" xp={user.xp} />

                        <LevelBadge className="hidden sm:inline-flex" nivel={user.level} />

                        <StreakBadge dias={user.streak} />

                        <Avatar className="h-9 w-9 lg:hidden">
                            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                <main className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8">
                    {children}
                </main>
            </div>

            {/* Bottom nav — mobile */}
            <nav className="fixed right-0 bottom-0 left-0 z-40 flex border-t bg-card/95 backdrop-blur lg:hidden">
                {items.map((item) => (
                    <NavLink
                        className={({ isActive }) =>
                            cn(
                                "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 font-medium text-xs transition-smooth",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )
                        }
                        href={item.to}
                        key={item.to}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
