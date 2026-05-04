/** biome-ignore-all lint/performance/useTopLevelRegex: <> */
/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
/** biome-ignore-all lint/style/noNestedTernary: <> */
"use client";

import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft, ArrowRight, CheckCircle2, Video } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function LessonVideoPage({ id }: { id: string }) {
    const router = useRouter();

    const lessonQuery = useLesson(id);
    const lesson = lessonQuery.data?.lesson;

    const lessonsQuery = useCourseLessons(lesson?.courseId);
    const list = lessonsQuery.data?.lessons ?? [];

    const completeLesson = useCompleteLesson(id);

    if (lessonQuery.isLoading) {
        return <LessonVideoSkeleton />;
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

    const safeContent = DOMPurify.sanitize(lesson.content ?? "");


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
                    <article
                        className="prose prose-sm max-w-none text-foreground"
                        dangerouslySetInnerHTML={{ __html: safeContent }}
                    />

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
                                onClick={() => router.push(getLessonHref(next))}
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
                                    href={getLessonHref(l)}
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

function LessonVideoSkeleton() {
    return (
        <div className="grid animate-pulse gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
                <div className="h-8 w-40 rounded bg-muted" />

                <Card className="overflow-hidden">
                    <div className="aspect-video bg-muted" />
                </Card>

                <Card className="space-y-3 p-5">
                    <div className="flex gap-2">
                        <div className="h-6 w-20 rounded-full bg-muted" />
                        <div className="h-6 w-16 rounded-full bg-muted" />
                    </div>

                    <div className="h-8 w-72 max-w-full rounded-xl bg-muted" />

                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-4 w-4/5 rounded bg-muted" />

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                        <div className="h-10 w-44 rounded-md bg-muted" />
                        <div className="h-10 w-36 rounded-md bg-muted" />
                    </div>
                </Card>
            </div>

            <aside className="hidden lg:block">
                <Card className="p-4">
                    <div className="mb-2 h-3 w-32 rounded bg-muted" />

                    <div className="space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                className="flex items-center gap-2 rounded-lg px-2 py-2"
                                key={i}
                            >
                                <div className="h-6 w-6 rounded-full bg-muted" />
                                <div className="h-4 w-44 rounded bg-muted" />
                            </div>
                        ))}
                    </div>
                </Card>
            </aside>
        </div>
    );
}
