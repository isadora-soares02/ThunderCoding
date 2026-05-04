"use client";

import {
    BookOpen,
    Compass,
    GraduationCap,
    HelpCircle,
    Users,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { useAdminStats } from "@/hooks/use-admin-stats";

export function AdminDashboardPage() {
    const { stats: s, isLoading, isError } = useAdminStats();

    if (isLoading) {
        return <p className="text-muted-foreground">Carregando dashboard...</p>;
    }

    if (isError || !s) {
        return <p className="text-destructive">Erro ao carregar dashboard.</p>;
    }

    const stats = [
        {
            label: "Cursos",
            value: s.totalCourses,
            icon: BookOpen,
            color: "text-primary bg-primary/10",
        },
        {
            label: "Trilhas",
            value: s.totalTrails,
            icon: Compass,
            color: "text-secondary bg-secondary/10",
        },
        {
            label: "Aulas",
            value: s.totalLessons,
            icon: GraduationCap,
            color: "text-accent bg-accent/10",
        },
        {
            label: "Perguntas",
            value: s.totalQuestions,
            icon: HelpCircle,
            color: "text-streak bg-streak/10",
        },
        {
            label: "Usuários",
            value: s.totalUsers.toLocaleString("pt-BR"),
            icon: Users,
            color: "text-success bg-success/10",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-3xl">Visão geral</h1>
                <p className="text-muted-foreground">
                    Resumo da sua plataforma ThunderCoding.
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {stats.map((stat) => (
                    <Card className="p-4" key={stat.label}>
                        <div
                            className={`grid h-10 w-10 place-items-center rounded-xl ${stat.color}`}
                        >
                            <stat.icon size={18} />
                        </div>

                        <p className="mt-3 text-muted-foreground text-xs uppercase tracking-wider">
                            {stat.label}
                        </p>

                        <p className="font-display text-2xl">{stat.value}</p>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="p-5">
                    <h2 className="mb-3 font-display text-lg">Cursos mais acessados</h2>

                    <ul className="space-y-3">
                        {s.mostAccessedCourses.map((course, i) => (
                            <li className="flex items-center gap-3" key={course.title}>
                                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                                    {i + 1}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">{course.title}</p>
                                </div>

                                <span className="text-muted-foreground text-sm">
                                    {course.accesses} acessos
                                </span>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card className="p-5">
                    <h2 className="mb-3 font-display text-lg">Últimas alterações</h2>

                    <ul className="space-y-3">
                        {s.latestUpdates.map((update) => (
                            <li
                                className="flex items-center gap-3"
                                key={`${update.type}-${update.title}-${update.date}`}
                            >
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                    {update.type === "Course" ? "Curso" : "Pergunta"}
                                </span>

                                <span className="flex-1 truncate">{update.title}</span>

                                <span className="text-muted-foreground text-xs">
                                    {new Date(update.date).toLocaleDateString("pt-BR")}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
}
