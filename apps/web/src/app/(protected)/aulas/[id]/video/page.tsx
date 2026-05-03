"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Video } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
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
                toast.success(`Você ganhou ${data.xpEarned} XP! ⚡`);

                if (data.unlockedAchievements.length > 0) {
                    toast.success(
                        `Conquista desbloqueada: ${data.unlockedAchievements.join(", ")}`
                    );
                }
            },
        });
    };

    const getLessonHref = (item: (typeof list)[number]) => {
        if (item.type === "vídeo") {
            return `/aulas/${item.id}/video`;
        }
        if (item.type === "quiz") {
            return `/quiz/${item.questionId}`;
        }
        if (item.type === "tarefa") {
            return `/tarefas/${item.taskId}`;
        }

        return `/aulas/${item.id}`;
    };

    const getYouTubeEmbedUrl = (url?: string | null) => {
        if (!url) {
            return null;
        }

        const videoId =
            url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)?.[1] ??
            null;

        if (!videoId) {
            return null;
        }

        return `https://www.youtube.com/embed/${videoId}`;
    };

    const embedUrl = getYouTubeEmbedUrl(lesson.videoUrl);

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
                <Button asChild size="sm" variant="ghost">
                    <Link href={`/cursos/${lesson.courseId}`}>
                        <ArrowLeft size={16} /> Voltar ao curso
                    </Link>
                </Button>

                <Card className="overflow-hidden">
                    <div className="relative aspect-video overflow-hidden bg-foreground">
                        {embedUrl ? (
                            <iframe
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="h-full w-full"
                                src={embedUrl}
                                title={lesson.title}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-background">
                                Vídeo indisponível
                            </div>
                        )}
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
                                onClick={() => router.replace(getLessonHref(next))}
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
