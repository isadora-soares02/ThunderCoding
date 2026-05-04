"use client";

import {
    ArrowLeft,
    CheckCircle2,
    ClipboardList,
    PartyPopper,
    Send,
    Trophy,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { XPBadge } from "@/components/badges/xp-badge";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitTask, useTask } from "@/hooks/use-task";

type Step = "inicio" | "andamento" | "concluido";

export function TaskViewPage({ id }: { id: string }) {
    const { data, isLoading, isError, error } = useTask(id);
    const submitTask = useSubmitTask(id);

    const [step, setStep] = useState<Step>("inicio");
    const [answer, setanswer] = useState("");
    const [erro, setErro] = useState("");

    if (isLoading) {
        return <TaskSkeleton />;
    }

    if (isError) {
        return <p className="text-destructive text-sm">{error.message}</p>;
    }

    const task = data?.task;

    if (!task) {
        return (
            <EmptyState
                action={
                    <Button asChild>
                        <Link href="/cursos">Ver cursos</Link>
                    </Button>
                }
                icon={ClipboardList}
                title="Tarefa não encontrada"
            />
        );
    }

    const enviar = () => {
        if (answer.trim().length < 10) {
            setErro("Sua answer precisa ter pelo menos 10 caracteres.");
            return;
        }

        setErro("");

        submitTask.mutate(answer, {
            onSuccess: () => {
                setStep("concluido");
            },
        });
    };

    return (
        <div className="mx-auto max-w-2xl space-y-5">
            <Button asChild size="sm" variant="ghost">
                <Link href={`/cursos/${task.courseId}`}>
                    <ArrowLeft size={16} /> Voltar ao curso
                </Link>
            </Button>

            {step === "inicio" && (
                <Card className="space-y-4 p-6">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">Tarefa</Badge>

                        <XPBadge size="sm" xp={task.xp} />
                    </div>

                    <h1 className="font-display text-2xl">{task.title}</h1>

                    <p className="text-muted-foreground">{task.description}</p>

                    <Card className="border-dashed bg-muted/40 p-4">
                        <p className="text-muted-foreground text-xs uppercase tracking-wider">
                            Objetivo
                        </p>

                        <p className="mt-1 font-medium">{task.objective}</p>
                    </Card>

                    <p className="text-muted-foreground text-sm">
                        Tempo estimado: <strong>{task.estimatedTime}</strong>
                    </p>

                    <Button
                        className="shadow-glow"
                        onClick={() => setStep("andamento")}
                        size="lg"
                    >
                        Começar tarefa
                    </Button>
                </Card>
            )}

            {step === "andamento" && (
                <Card className="space-y-4 p-6">
                    <div className="flex items-center gap-2">
                        <Badge>Em andamento</Badge>

                        <XPBadge size="sm" xp={task.xp} />
                    </div>

                    <h1 className="font-display text-2xl">{task.title}</h1>

                    <p className="text-muted-foreground">{task.description}</p>

                    <div>
                        <p className="mb-2 font-semibold">Requisitos</p>

                        <ul className="space-y-1.5">
                            {task.requirements.map((r) => (
                                <li className="flex items-start gap-2 text-sm" key={r}>
                                    <CheckCircle2
                                        className="mt-0.5 shrink-0 text-success"
                                        size={16}
                                    />{" "}
                                    {r}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <label className="font-semibold text-sm" htmlFor="resposta">
                            Sua answer / código
                        </label>

                        <Textarea
                            className="mt-1 font-mono text-sm"
                            id="resposta"
                            onChange={(e) => setanswer(e.target.value)}
                            placeholder="Cole seu código ou answer aqui..."
                            rows={8}
                            value={answer}
                        />

                        {erro && <p className="mt-1 text-destructive text-xs">{erro}</p>}
                    </div>

                    <Button className="shadow-glow" onClick={enviar}>
                        <Send size={16} /> Enviar answer
                    </Button>
                </Card>
            )}

            {step === "concluido" && (
                <Card className="animate-pop-in space-y-4 bg-gradient-card p-8 text-center">
                    <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-xp text-accent-foreground shadow-xp">
                        <PartyPopper size={32} />
                    </div>

                    <h2 className="font-display text-3xl">Parabéns, missão concluída!</h2>

                    <p className="text-muted-foreground">
                        Você ganhou {task.xp} XP e está mais perto da próxima conquista.
                    </p>

                    <div className="flex justify-center gap-2">
                        <XPBadge xp={task.xp} />

                        <Badge variant="secondary">
                            <Trophy size={12} /> +1 progresso
                        </Badge>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
                        <Button asChild variant="outline">
                            <Link href={`/cursos/${task.courseId}`}>Voltar ao curso</Link>
                        </Button>

                        <Button asChild className="shadow-glow">
                            <Link href="/cursos">Próximo desafio</Link>
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}

function TaskSkeleton() {
    return (
        <div className="mx-auto max-w-2xl animate-pulse space-y-5">
            <div className="h-8 w-40 rounded bg-muted" />

            <Card className="space-y-4 p-6">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-20 rounded-full bg-muted" />
                    <div className="h-6 w-16 rounded-full bg-muted" />
                </div>

                <div className="h-8 w-72 max-w-full rounded-xl bg-muted" />

                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-4/5 rounded bg-muted" />

                <Card className="border-dashed p-4">
                    <div className="h-3 w-20 rounded bg-muted" />
                    <div className="mt-2 h-5 w-3/4 rounded bg-muted" />
                </Card>

                <div className="h-4 w-48 rounded bg-muted" />

                <div className="h-12 w-44 rounded-xl bg-muted" />
            </Card>
        </div>
    );
}
