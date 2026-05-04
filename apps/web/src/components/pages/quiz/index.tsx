/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
"use client";

import {
    ArrowLeft,
    CheckCircle2,
    HelpCircle,
    RotateCcw,
    Trophy,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { XPBadge } from "@/components/badges/xp-badge";
import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    useAnswerQuestion,
    useCourseQuestions,
    useQuestion,
} from "@/hooks/use-quiz";
import { cn } from "@/lib/utils";

type Letter = "a" | "b" | "c" | "d";

export function QuizViewPage({ id }: { id: string }) {
    const startQuestionQuery = useQuestion(id);
    const startQuestion = startQuestionQuery.data?.question;

    const questionsQuery = useCourseQuestions(startQuestion?.courseId);
    const answerQuestion = useAnswerQuestion();

    const allForCourse = useMemo(() => {
        const questions = questionsQuery.data?.questions ?? [];

        if (!startQuestion) {
            return [];
        }

        const startIndex = questions.findIndex((q) => q.id === startQuestion.id);

        if (startIndex <= 0) {
            return questions;
        }

        return [...questions.slice(startIndex), ...questions.slice(0, startIndex)];
    }, [questionsQuery.data?.questions, startQuestion]);

    const [idx, setIdx] = useState(0);
    const [escolha, setEscolha] = useState<Letter | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [acertos, setAcertos] = useState(0);
    const [xpGanho, setXpGanho] = useState(0);
    const [final, setFinal] = useState(false);
    const [feedback, setFeedback] = useState<{
        correct: boolean;
        explanation: string;
        correctAnswer: Letter;
    } | null>(null);

    const isLoading = startQuestionQuery.isLoading || questionsQuery.isLoading;

    if (isLoading) {
        return <QuizSkeleton />;
    }

    if (startQuestionQuery.isError || questionsQuery.isError) {
        return <p className="text-destructive text-sm">Erro ao carregar quiz.</p>;
    }

    if (!startQuestion || allForCourse.length === 0) {
        return (
            <EmptyState
                action={
                    <Button asChild>
                        <Link href="/cursos">Ver cursos</Link>
                    </Button>
                }
                icon={HelpCircle}
                title="Quiz não encontrado"
            />
        );
    }

    const q = allForCourse[idx];
    const total = allForCourse.length;

    const escolher = (l: Letter) => {
        if (q?.completed) {
            return;
        }

        if (showFeedback || answerQuestion.isPending) {
            return;
        }

        setEscolha(l);

        answerQuestion.mutate(
            {
                questionId: q?.id,
                answer: l,
            },
            {
                onSuccess: (data) => {
                    setShowFeedback(true);
                    setFeedback({
                        correct: data.correct,
                        explanation: data.explanation,
                        correctAnswer: data.correctAnswer,
                    });

                    if (data.correct) {
                        setAcertos((a) => a + 1);
                        setXpGanho((x) => x + data.xpEarned);
                    }
                },
            }
        );
    };

    const proxima = () => {
        if (idx + 1 >= total) {
            setFinal(true);
            return;
        }

        setIdx((i) => i + 1);
        setEscolha(null);
        setShowFeedback(false);
        setFeedback(null);
    };

    const reiniciar = () => {
        setIdx(0);
        setEscolha(null);
        setShowFeedback(false);
        setAcertos(0);
        setXpGanho(0);
        setFinal(false);
        setFeedback(null);
    };

    if (final) {
        const pct = Math.round((acertos / total) * 100);

        return (
            <div className="mx-auto max-w-xl space-y-4">
                <Card className="animate-pop-in space-y-4 bg-gradient-card p-8 text-center">
                    <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-xp text-accent-foreground shadow-xp">
                        <Trophy size={32} />
                    </div>

                    <h2 className="font-display text-3xl">Quiz finalizado!</h2>

                    <p className="text-muted-foreground">
                        Você acertou {acertos} de {total} ({pct}%).
                    </p>

                    <div className="flex justify-center">
                        <XPBadge size="lg" xp={xpGanho} />
                    </div>

                    <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
                        <Button onClick={reiniciar} variant="outline">
                            <RotateCcw size={16} /> Refazer
                        </Button>

                        <Button asChild className="shadow-glow">
                            <Link href={`/cursos/${q?.courseId}`}>Voltar ao curso</Link>
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-5">
            <Button asChild size="sm" variant="ghost">
                <Link href={`/cursos/${q?.courseId}`}>
                    <ArrowLeft size={16} /> Voltar ao curso
                </Link>
            </Button>

            <Card className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                    <Badge variant="outline">
                        Pergunta {idx + 1} de {total}
                    </Badge>
                    <Badge variant="secondary">+{q?.xp} XP</Badge>
                </div>

                <ProgressBar
                    gradient
                    value={((idx + (showFeedback ? 1 : 0)) / total) * 100}
                />

                <h2 className="font-display text-xl sm:text-2xl">{q?.question}</h2>

                <div className="grid gap-2">
                    {(Object.entries(q?.options) as [Letter, string][]).map(
                        ([letter, text]) => {
                            const isCorrect = letter === feedback?.correctAnswer;
                            const isChosen = letter === escolha;
                            const showRight = showFeedback && isCorrect;
                            const showWrong = showFeedback && isChosen && !isCorrect;

                            return (
                                <button
                                    className={cn(
                                        "group flex items-center gap-3 rounded-2xl border p-4 text-left transition-smooth",
                                        !showFeedback && "hover:border-primary hover:bg-primary/5",
                                        isChosen && !showFeedback && "border-primary bg-primary/10",
                                        showRight && "border-success bg-success/10",
                                        showWrong && "border-destructive bg-destructive/10"
                                    )}
                                    key={letter}
                                    onClick={() => escolher(letter)}
                                >
                                    <span
                                        className={cn(
                                            "grid h-9 w-9 shrink-0 place-items-center rounded-xl border font-semibold uppercase",
                                            showRight &&
                                            "border-success bg-success text-success-foreground",
                                            showWrong &&
                                            "border-destructive bg-destructive text-destructive-foreground",
                                            !showFeedback &&
                                            isChosen &&
                                            "border-primary bg-primary text-primary-foreground"
                                        )}
                                    >
                                        {letter}
                                    </span>

                                    <span className="flex-1">{text}</span>

                                    {showRight && (
                                        <CheckCircle2 className="text-success" size={20} />
                                    )}

                                    {showWrong && (
                                        <XCircle className="text-destructive" size={20} />
                                    )}
                                </button>
                            );
                        }
                    )}
                </div>

                {answerQuestion.isError && (
                    <p className="text-destructive text-sm">
                        {answerQuestion.error.message}
                    </p>
                )}

                {showFeedback && feedback && (
                    <Card
                        className={cn(
                            "border-dashed p-4",
                            feedback.correct
                                ? "border-success/40 bg-success/5"
                                : "border-destructive/40 bg-destructive/5"
                        )}
                    >
                        <p className="mb-1 font-semibold">
                            {feedback.correct ? "🎉 Resposta correta!" : "Quase lá!"}
                        </p>

                        <p className="text-muted-foreground text-sm">
                            {feedback.explanation}
                        </p>
                    </Card>
                )}

                {showFeedback && (
                    <Button className="w-full shadow-glow" onClick={proxima} size="lg">
                        {idx + 1 >= total ? "Ver resultado" : "Próxima pergunta"}
                    </Button>
                )}
            </Card>
        </div>
    );
}

function QuizSkeleton() {
    return (
        <div className="mx-auto max-w-2xl animate-pulse space-y-5">
            <div className="h-8 w-40 rounded bg-muted" />

            <Card className="space-y-5 p-6">
                <div className="flex justify-between">
                    <div className="h-6 w-32 rounded-full bg-muted" />
                    <div className="h-6 w-20 rounded-full bg-muted" />
                </div>

                <div className="h-3 w-full rounded-full bg-muted" />

                <div className="h-8 w-3/4 rounded bg-muted" />
                <div className="h-8 w-1/2 rounded bg-muted" />

                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            className="flex items-center gap-3 rounded-2xl border p-4"
                            key={i}
                        >
                            <div className="h-9 w-9 rounded-xl bg-muted" />

                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-full rounded bg-muted" />
                                <div className="h-4 w-2/3 rounded bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="h-12 w-full rounded-xl bg-muted" />
            </Card>
        </div>
    );
}
