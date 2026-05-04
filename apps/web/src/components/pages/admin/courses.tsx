/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
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
import { useAdminCourses } from "@/hooks/use-admin-courses";
import { type CourseInput, courseSchema } from "@/schemas";
import type { Course } from "@/types";

export default function AdminCoursesPage() {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Course | null>(null);

    const {
        courses,
        isLoading,
        isError,
        createCourse,
        updateCourse,
        deleteCourse,
    } = useAdminCourses();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(courseSchema),
    });

    const openNew = () => {
        setEditing(null);
        reset({
            title: "",
            description: "",
            language: "",
            level: "Iniciante",
            duration: "",
            instructor: "",
            xp: 100,
            banner: "",
            status: "rascunho",
        });
        setOpen(true);
    };

    const openEdit = (c: Course) => {
        setEditing(c);
        reset({
            title: c.title,
            description: c.description,
            language: c.language,
            level: c.level,
            duration: c.duration,
            instructor: c.instructor,
            xp: c.xp,
            banner: c.banner ?? "",
            status: c.status,
        });
        setOpen(true);
    };

    const onSubmit = async (data: CourseInput) => {
        try {
            if (editing) {
                await updateCourse.mutateAsync({
                    id: editing.id,
                    data,
                });
                toast.success("Curso atualizado!");
            } else {
                await createCourse.mutateAsync(data);
                toast.success("Curso criado!");
            }

            setOpen(false);
        } catch {
            toast.error("Erro ao salvar curso.");
        }
    };

    const remover = async (id: string) => {
        try {
            await deleteCourse.mutateAsync(id);
            toast.success("Curso excluído.");
        } catch {
            toast.error("Erro ao excluir curso.");
        }
    };

    const toggleStatus = async (course: Course) => {
        const nextStatus = course.status === "publicado" ? "rascunho" : "publicado";

        try {
            await updateCourse.mutateAsync({
                id: course.id,
                data: {
                    title: course.title,
                    description: course.description,
                    language: course.language,
                    level: course.level,
                    duration: course.duration,
                    xp: course.xp,
                    instructor: course.instructor,
                    banner: course.banner ?? "",
                    status: nextStatus,
                },
            });
        } catch {
            toast.error("Erro ao alterar status.");
        }
    };

    if (isLoading) {
        return <p className="text-muted-foreground">Carregando cursos...</p>;
    }

    if (isError) {
        return <p className="text-destructive">Erro ao carregar cursos.</p>;
    }

    return (
        <div>
            <AdminPageHeader
                actionLabel="Novo curso"
                description="Gerencie todos os cursos da plataforma."
                onAction={openNew}
                title="Cursos"
            />

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="p-3 font-semibold">Título</th>
                                <th className="p-3 font-semibold">Linguagem</th>
                                <th className="p-3 font-semibold">Nível</th>
                                <th className="p-3 font-semibold">XP</th>
                                <th className="p-3 font-semibold">Status</th>
                                <th className="p-3 text-right font-semibold">Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {courses.map((c) => (
                                <tr className="border-t" key={c.id}>
                                    <td className="p-3 font-medium">{c.title}</td>
                                    <td className="p-3">{c.language}</td>
                                    <td className="p-3">
                                        <Badge variant="outline">{c.level}</Badge>
                                    </td>
                                    <td className="p-3">{c.xp}</td>
                                    <td className="p-3">
                                        <button onClick={() => toggleStatus(c)}>
                                            <Badge
                                                className="cursor-pointer"
                                                variant={
                                                    c.status === "publicado" ? "default" : "secondary"
                                                }
                                            >
                                                {c.status}
                                            </Badge>
                                        </button>
                                    </td>
                                    <td className="p-3 text-right">
                                        <Button
                                            onClick={() => openEdit(c)}
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <Pencil size={14} />
                                        </Button>

                                        <Button
                                            className="text-destructive"
                                            onClick={() => remover(c.id)}
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
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Editar curso" : "Novo curso"}</DialogTitle>
                    </DialogHeader>

                    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                        <Field error={errors.title?.message} label="Título">
                            <Input {...register("title")} />
                        </Field>

                        <Field error={errors.description?.message} label="Descrição">
                            <Textarea rows={3} {...register("description")} />
                        </Field>

                        <Field error={errors.instructor?.message} label="Instrutor">
                            <Input {...register("instructor")} />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field error={errors.language?.message} label="Linguagem/Tema">
                                <Input {...register("language")} />
                            </Field>

                            <Field error={errors.level?.message} label="Nível">
                                <Select
                                    onValueChange={(v) =>
                                        setValue("level", v as CourseInput["level"])
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
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Field error={errors.duration?.message} label="Duração estimada">
                                <Input placeholder="Ex: 8h" {...register("duration")} />
                            </Field>

                            <Field error={errors.xp?.message} label="XP total">
                                <Input
                                    type="number"
                                    {...register("xp", { valueAsNumber: true })}
                                />
                            </Field>
                        </div>

                        <Field error={errors.banner?.message} label="Banner (URL opcional)">
                            <Input placeholder="https://..." {...register("banner")} />
                        </Field>

                        <Field error={errors.status?.message} label="Status">
                            <Select
                                onValueChange={(v) =>
                                    setValue("status", v as CourseInput["status"])
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
                                disabled={createCourse.isPending || updateCourse.isPending}
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
