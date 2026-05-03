"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, FileText } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    useCompleteLesson,
    useCourseLessons,
    useLesson,
} from "@/hooks/use-lesson";
import { cn } from "@/lib/utils";

export default function LessonView() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const router = useRouter();

    const lessonQuery = useLesson(id);
    const lesson = lessonQuery.data?.lesson;

    const lessonsQuery = useCourseLessons(lesson?.courseId);
    const list = lessonsQuery.data?.lessons ?? [];

    const completeLesson = useCompleteLesson(id, lesson?.courseId);

    if (lessonQuery.isLoading) {
        return <p className="text-muted-foreground text-sm">Carregando aula...</p>;
    }

    if (lessonQuery.isError) {
        return (
            <p className="text-destructive text-sm">{lessonQuery.error.message}</p>
        );
    }

    if (!lesson) {
        return (
            <EmptyState
                action={
                    <Button asChild>
                        <Link href="/cursos">Ver cursos</Link>
                    </Button>
                }
                icon={FileText}
                title="Aula não encontrada"
            />
        );
    }

    const idx = list.findIndex((l) => l.id === lesson.id);
    const prev = list[idx - 1];
    const next = list[idx + 1];
    const done = lesson.completed ?? false;
    const progresso =
        list.length > 0 ? ((idx + (done ? 1 : 0)) / list.length) * 100 : 0;

    const concluir = () => {
        if (done || completeLesson.isPending) {
            return;
        }

        completeLesson.mutate(undefined, {
            onSuccess: (data) => {
                toast.success(`Você ganhou ${data.xpGanho} XP! ⚡`);

                if (data.conquistasDesbloqueadas.length > 0) {
                    toast.success(
                        `Conquista desbloqueada: ${data.conquistasDesbloqueadas.join(", ")}`
                    );
                }
            },
        });
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="space-y-5">
                <Button asChild size="sm" variant="ghost">
                    <Link href={`/cursos/${lesson.courseId}`}>
                        <ArrowLeft size={16} /> Voltar ao curso
                    </Link>
                </Button>

                <Card className="space-y-4 p-6 sm:p-8">
                    <div className="flex items-center gap-2">
                        <Badge className="capitalize" variant="outline">
                            {lesson.type}
                        </Badge>
                        <Badge variant="secondary">+{lesson.xp} XP</Badge>
                    </div>

                    <h1 className="font-display text-3xl">{lesson.title}</h1>

                    <ProgressBar gradient value={progresso} />

                    <article className="prose prose-sm max-w-none whitespace-pre-line text-foreground">
                        {lesson.content}
                    </article>

                    <Card className="border-dashed bg-muted/40 p-4">
                        <p className="mb-2 text-muted-foreground text-xs uppercase tracking-wider">
                            Exemplo
                        </p>
                        <pre className="overflow-x-auto rounded-xl bg-foreground p-4 text-background text-xs">
                            <code>{`function somar(a: number, b: number): number {
  return a + b;
}

console.log(somar(2, 3)); // 5`}</code>
                        </pre>
                    </Card>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                            className={cn(!done && "shadow-glow")}
                            disabled={done || completeLesson.isPending}
                            onClick={concluir}
                            variant={done ? "outline" : "default"}
                        >
                            <CheckCircle2 size={16} />
                            {done
                                ? "Aula concluída"
                                : completeLesson.isPending
                                    ? "Salvando..."
                                    : "Marcar como concluída"}
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                disabled={!prev}
                                onClick={() => prev && router.replace(`/aulas/${prev.id}`)}
                                variant="outline"
                            >
                                <ArrowLeft size={16} /> Aula anterior
                            </Button>

                            <Button
                                disabled={!next}
                                onClick={() => next && router.replace(`/aulas/${next.id}`)}
                            >
                                Próxima aula <ArrowRight size={16} />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
                <Card className="p-4">
                    <p className="mb-2 text-muted-foreground text-xs uppercase tracking-wider">
                        Aulas do curso
                    </p>

                    <ul className="space-y-1">
                        {list.map((l) => (
                            <li key={l.id}>
                                <Link
                                    className={cn(
                                        "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-smooth",
                                        l.id === lesson.id
                                            ? "bg-primary/10 font-semibold text-primary"
                                            : "hover:bg-muted"
                                    )}
                                    href={
                                        l.type === "video"
                                            ? `/aulas/${l.id}/video`
                                            : `/aulas/${l.id}`
                                    }
                                >
                                    <span
                                        className={cn(
                                            "grid h-6 w-6 place-items-center rounded-full text-xs",
                                            l.completed
                                                ? "bg-success text-success-foreground"
                                                : "bg-muted"
                                        )}
                                    >
                                        {l.completed ? "✓" : l.order}
                                    </span>

                                    <span className="truncate">{l.title}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Card>
            </aside>
        </div>
    );
}
