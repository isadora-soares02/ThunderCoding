import { ArrowRight, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { XPBadge } from "@/components/badges/xp-badge";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Course } from "@/types";

const bannerClasses: Record<string, string> = {
    "from-primary-glow to-primary": "from-primary-glow to-primary",
    "from-success to-secondary": "from-success to-secondary",
    "from-primary to-secondary": "from-primary to-secondary",
    "from-streak to-accent": "from-streak to-accent",
    "from-accent to-streak": "from-accent to-streak",
    "from-secondary to-primary": "from-secondary to-primary",
};

export function CourseCard({ course }: { course: Course }) {
    const started = course.progress > 0;
    const done = course.progress >= 100;
    return (
        <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-card">
            <div
                className={cn(
                    "relative flex h-32 items-end bg-linear-to-br p-4",
                    bannerClasses[course.banner] ?? "from-primary to-secondary"
                )}
            >
                <div className="absolute top-3 right-3">
                    <XPBadge size="sm" xp={course.xp} />
                </div>

                <Badge
                    className="bg-white/90 text-foreground hover:bg-white"
                    variant="secondary"
                >
                    {course.language}
                </Badge>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <Badge className="text-xs" variant="outline">
                            {course.level}
                        </Badge>
                    </div>

                    <h3 className="font-display text-lg leading-tight">{course.title}</h3>

                    <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
                        {course.description}
                    </p>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground text-xs">
                    <span className="inline-flex items-center gap-1">
                        <Clock size={12} /> {course.duration}
                    </span>

                    <span className="inline-flex items-center gap-1">
                        <BookOpen size={12} /> {course.totalLessons} aulas
                    </span>
                </div>

                {started && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progresso</span>

                            <span className="font-semibold">{course.progress}%</span>
                        </div>

                        <ProgressBar gradient value={course.progress} />
                    </div>
                )}

                <Button asChild className="group/btn mt-1">
                    <Link href={`/cursos/${course.id}`}>
                        {done ? "Revisar" : started ? "Continuar" : "Começar"}

                        <ArrowRight
                            className="transition-transform group-hover/btn:translate-x-1"
                            size={16}
                        />
                    </Link>
                </Button>
            </div>
        </article>
    );
}
