"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAdminTrails } from "@/hooks/use-admin-trails";
import { type TrailInput, trailSchema } from "@/schemas";
import type { Trail } from "@/types";

export function AdminTrailsPage() {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Trail | null>(null);

    const { trails, isLoading, isError, createTrail, updateTrail, deleteTrail } =
        useAdminTrails();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(trailSchema),
    });

    const openNew = () => {
        setEditing(null);
        reset({
            name: "",
            description: "",
            level: "Iniciante",
            totalXp: 500,
            status: "rascunho",
        });
        setOpen(true);
    };

    const openEdit = (t: Trail) => {
        setEditing(t);
        reset({
            name: t.name,
            description: t.description,
            level: t.level,
            totalXp: t.totalXp,
            status: t.status,
        });
        setOpen(true);
    };

    const onSubmit = async (data: TrailInput) => {
        try {
            if (editing) {
                await updateTrail.mutateAsync({
                    id: editing.id,
                    data,
                });
                toast.success("Trilha atualizada!");
            } else {
                await createTrail.mutateAsync(data);
                toast.success("Trilha criada!");
            }

            setOpen(false);
        } catch {
            toast.error("Erro ao salvar trilha.");
        }
    };

    const remover = async (id: string) => {
        try {
            await deleteTrail.mutateAsync(id);
            toast.success("Trilha excluída.");
        } catch {
            toast.error("Erro ao excluir trilha.");
        }
    };

    const toggleStatus = async (trail: Trail) => {
        const nextStatus = trail.status === "publicado" ? "rascunho" : "publicado";

        try {
            await updateTrail.mutateAsync({
                id: trail.id,
                data: {
                    name: trail.name,
                    description: trail.description,
                    level: trail.level,
                    totalXp: trail.totalXp,
                    status: nextStatus,
                },
            });
        } catch {
            toast.error("Erro ao alterar status.");
        }
    };

    if (isLoading) {
        return <p className="text-muted-foreground">Carregando trilhas...</p>;
    }

    if (isError) {
        return <p className="text-destructive">Erro ao carregar trilhas.</p>;
    }

    return (
        <div>
            <AdminPageHeader
                actionLabel="Nova trilha"
                description="Gerencie trilhas de aprendizado."
                onAction={openNew}
                title="Trilhas"
            />

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="p-3">Nome</th>
                                <th className="p-3">Nível</th>
                                <th className="p-3">Cursos</th>
                                <th className="p-3">XP</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {trails.map((t) => (
                                <tr className="border-t" key={t.id}>
                                    <td className="p-3 font-medium">{t.name}</td>

                                    <td className="p-3">
                                        <Badge variant="outline">{t.level}</Badge>
                                    </td>

                                    <td className="p-3">{t.courseIds?.length ?? 0}</td>

                                    <td className="p-3">{t.totalXp}</td>

                                    <td className="p-3">
                                        <button onClick={() => toggleStatus(t)}>
                                            <Badge
                                                className="cursor-pointer"
                                                variant={
                                                    t.status === "publicado" ? "default" : "secondary"
                                                }
                                            >
                                                {t.status}
                                            </Badge>
                                        </button>
                                    </td>

                                    <td className="p-3 text-right">
                                        <Button
                                            onClick={() => openEdit(t)}
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <Pencil size={14} />
                                        </Button>

                                        <Button
                                            className="text-destructive"
                                            onClick={() => remover(t.id)}
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Dialog onOpenChange={setOpen} open={open}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? "Editar trilha" : "Nova trilha"}
                        </DialogTitle>
                    </DialogHeader>

                    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                        <Field error={errors.name?.message} label="Nome">
                            <Input {...register("name")} />
                        </Field>

                        <Field error={errors.description?.message} label="Descrição">
                            <Textarea rows={3} {...register("description")} />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field error={errors.level?.message} label="Nível">
                                <Select
                                    onValueChange={(v) =>
                                        setValue("level", v as TrailInput["level"])
                                    }
                                    value={watch("level")}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="Iniciante">Iniciante</SelectItem>
                                        <SelectItem value="Intermediário">Intermediário</SelectItem>
                                        <SelectItem value="Avançado">Avançado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field error={errors.totalXp?.message} label="XP total">
                                <Input
                                    type="number"
                                    {...register("totalXp", { valueAsNumber: true })}
                                />
                            </Field>
                        </div>

                        <Field error={errors.status?.message} label="Status">
                            <Select
                                onValueChange={(v) =>
                                    setValue("status", v as TrailInput["status"])
                                }
                                value={watch("status")}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="rascunho">Rascunho</SelectItem>
                                    <SelectItem value="publicado">Publicado</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <DialogFooter>
                            <Button
                                onClick={() => setOpen(false)}
                                type="button"
                                variant="outline"
                            >
                                Cancelar
                            </Button>

                            <Button
                                disabled={createTrail.isPending || updateTrail.isPending}
                                type="submit"
                            >
                                {editing ? "Salvar" : "Criar"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            {children}
            {error && <p className="text-destructive text-xs">{error}</p>}
        </div>
    );
}
