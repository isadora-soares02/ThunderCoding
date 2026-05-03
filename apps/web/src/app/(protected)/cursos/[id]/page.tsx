"use client";

import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    ClipboardList,
    FileText,
    HelpCircle,
    PlayCircle,
    Video,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { XPBadge } from "@/components/badges/xp-badge";
import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourseDetail } from "@/hooks/use-course-details";

const lessonIcon = {
    text: FileText,
    video: Video,
    assignment: ClipboardList,
    quiz: HelpCircle,
} as const;

export default function CourseDetail() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    console.log(id);

    const { course, lessons, tasks, questions, isLoading, isError, error } =
        useCourseDetail(id);

    if (isLoading) {
        return <p className="text-muted-foreground text-sm">Carregando curso...</p>;
    }

    if (isError) {
        return <p className="text-destructive text-sm">{error?.message}</p>;
    }

    if (!course) {
        return (
            <EmptyState
                action={
                    <Button asChild>
                        <Link href="/cursos">Ver cursos</Link>
                    </Button>
                }
                icon={BookOpen}
                title="Curso não encontrado"
            />
        );
    }

    const proxima = lessons.find((l) => !l.completed) || lessons[0];

    return (
        <div className="space-y-6">
            <Button asChild size="sm" variant="ghost">
                <Link href="/cursos">
                    <ArrowLeft size={16} /> Voltar
                </Link>
            </Button>

            <Card className="overflow-hidden">
                <div className={`h-36 bg-gradient-to-br ${course.banner}`} />

                <div className="space-y-4 p-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{course.level}</Badge>

                        <Badge variant="secondary">{course.language}</Badge>

                        <XPBadge size="sm" xp={course.xp} />
                    </div>

                    <h1 className="font-display text-3xl">{course.title}</h1>

                    <p className="text-muted-foreground">{course.description}</p>

                    <p className="text-sm">
                        Instrutor:{" "}
                        <span className="font-semibold">{course.instructor}</span> ·{" "}
                        {course.duration} · {course.totalLessons} aulas
                    </p>

                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span className="font-semibold">{course.progress}%</span>
                        </div>
                        <ProgressBar gradient value={course.progress} />
                    </div>

                    {proxima && (
                        <Button asChild className="shadow-glow" size="lg">
                            <Link href={`/aulas/${proxima.id}`}>
                                <PlayCircle size={18} />{" "}
                                {course.progress === 0 ? "Começar curso" : "Continuar"}
                            </Link>
                        </Button>
                    )}
                </div>
            </Card>

            <Tabs defaultValue="aulas">
                <TabsList>
                    <TabsTrigger value="aulas">Aulas ({lessons.length})</TabsTrigger>

                    <TabsTrigger value="tarefas">Tarefas ({tasks.length})</TabsTrigger>

                    <TabsTrigger value="quizzes">
                        Quizzes ({questions.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent className="mt-4 space-y-2" value="aulas">
                    {lessons.length === 0 && <EmptyState title="Sem aulas ainda" />}

                    {lessons.map((l) => {
                        const Icon = lessonIcon[l.type];

                        return (
                            <Card
                                className="flex items-center gap-3 p-3 transition-smooth hover:shadow-soft"
                                key={l.id}
                            >
                                <div
                                    className={`grid h-10 w-10 place-items-center rounded-xl ${l.completed ? "bg-success/15 text-success" : "bg-primary/10 text-primary"}`}
                                >
                                    {l.completed ? (
                                        <CheckCircle2 size={18} />
                                    ) : (
                                        <Icon size={18} />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">{l.title}</p>
                                    <p className="text-muted-foreground text-xs capitalize">
                                        {l.type} · {l.durationMin} min · +{l.xp} XP
                                    </p>
                                </div>
                                <Button
                                    asChild
                                    size="sm"
                                    variant={l.completed ? "outline" : "default"}
                                >
                                    <Link
                                        href={
                                            l.type === "video"
                                                ? `/aulas/${l.id}/video`
                                                : l.type === "quiz"
                                                    ? `/quiz/${questions[0]?.id ?? l.id}`
                                                    : l.type === "assignment"
                                                        ? `/tarefas/${tasks[0]?.id ?? l.id}`
                                                        : `/aulas/${l.id}`
                                        }
                                    >
                                        {l.completed ? "Revisar" : "Abrir"}
                                    </Link>
                                </Button>
                            </Card>
                        );
                    })}
                </TabsContent>

                <TabsContent className="mt-4 space-y-2" value="tarefas">
                    {tasks.length === 0 && (
                        <EmptyState title="Sem tarefas para este curso" />
                    )}

                    {tasks.map((t) => (
                        <Card className="flex items-center gap-3 p-3" key={t.id}>
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
                                <ClipboardList size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">{t.title}</p>

                                <p className="text-muted-foreground text-xs">
                                    {t.estimatedTime} · +{t.xp} XP
                                </p>
                            </div>

                            <Button asChild size="sm">
                                <Link href={`/tarefas/${t.id}`}>Começar</Link>
                            </Button>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent className="mt-4 space-y-2" value="quizzes">
                    {questions.length === 0 && (
                        <EmptyState title="Sem quizzes para este curso" />
                    )}

                    {questions.map((q) => (
                        <Card className="flex items-center gap-3 p-3" key={q.id}>
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/15 text-secondary">
                                <HelpCircle size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">{q.question}</p>

                                <p className="text-muted-foreground text-xs">
                                    {q.difficulty} · +{q.xp} XP
                                </p>
                            </div>

                            <Button asChild size="sm">
                                <Link href={`/quiz/${q.id}`}>Responder</Link>
                            </Button>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}
