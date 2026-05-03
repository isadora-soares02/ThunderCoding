"use client";

import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Maximize2,
    Pause,
    Play,
    Video,
    Volume2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
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

export default function LessonVideo() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const router = useRouter();

    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(35);

    const lessonQuery = useLesson(id);
    const lesson = lessonQuery.data?.lesson;

    const lessonsQuery = useCourseLessons(lesson?.courseId);
    const list = lessonsQuery.data?.lessons ?? [];

    const completeLesson = useCompleteLesson(id, lesson?.courseId);

    if (lessonQuery.isLoading) {
        return <p className="text-muted-foreground text-sm">Carregando vídeo...</p>;
    }

    if (lessonQuery.isError) {
        return (
            <p className="text-destructive text-sm">{lessonQuery.error.message}</p>
        );
    }

    if (!lesson) {
        return <EmptyState icon={Video} title="Aula não encontrada" />;
    }

    const idx = list.findIndex((l) => l.id === lesson.id);
    const next = list[idx + 1];
    const done = lesson.completed ?? false;

    const concluir = () => {
        if (done || completeLesson.isPending) {
            return;
        }

        completeLesson.mutate(undefined, {
            onSuccess: (data) => {
                setProgress(100);
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
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
                <Button asChild size="sm" variant="ghost">
                    <Link href={`/cursos/${lesson.courseId}`}>
                        <ArrowLeft size={16} /> Voltar ao curso
                    </Link>
                </Button>

                <Card className="overflow-hidden">
                    <div className="relative flex aspect-video items-center justify-center bg-foreground">
                        <div className="absolute inset-0 bg-gradient-hero opacity-40" />

                        <button
                            aria-label={playing ? "Pausar" : "Reproduzir"}
                            className="relative grid h-20 w-20 place-items-center rounded-full bg-white/95 text-primary shadow-glow transition-bounce hover:scale-110"
                            onClick={() => setPlaying((p) => !p)}
                        >
                            {playing ? (
                                <Pause size={28} />
                            ) : (
                                <Play className="ml-1" size={28} />
                            )}
                        </button>
                    </div>

                    <div className="space-y-2 px-4 py-3">
                        <ProgressBar className="h-1.5" gradient value={progress} />

                        <div className="flex items-center justify-between text-muted-foreground text-xs">
                            <div className="flex items-center gap-2">
                                <button
                                    aria-label={playing ? "Pausar" : "Reproduzir"}
                                    onClick={() => setPlaying((p) => !p)}
                                >
                                    {playing ? <Pause size={14} /> : <Play size={14} />}
                                </button>

                                <Volume2 size={14} />
                                <span>02:15 / {lesson.durationMin}:00</span>
                            </div>

                            <button aria-label="Tela cheia">
                                <Maximize2 size={14} />
                            </button>
                        </div>
                    </div>
                </Card>

                <Card className="space-y-3 p-5">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">Vídeo</Badge>
                        <Badge variant="secondary">+{lesson.xp} XP</Badge>
                    </div>

                    <h1 className="font-display text-2xl">{lesson.title}</h1>
                    <p className="text-muted-foreground">{lesson.content}</p>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
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
                                    : "Continuar aula"}
                        </Button>

                        {next && (
                            <Button
                                onClick={() =>
                                    router.replace(
                                        next.type === "video"
                                            ? `/aulas/${next.id}/video`
                                            : `/aulas/${next.id}`
                                    )
                                }
                                variant="outline"
                            >
                                Próxima aula <ArrowRight size={16} />
                            </Button>
                        )}
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
