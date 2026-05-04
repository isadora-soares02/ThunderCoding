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
import { useAdminLessons } from "@/hooks/use-admin-lessons";
import { type LessonInput, lessonSchema } from "@/schemas";
import type { Lesson } from "@/types";

export default function AdminLessonsPage() {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Lesson | null>(null);

    const {
        courses,
        lessons,
        isLoading,
        isError,
        createLesson,
        updateLesson,
        deleteLesson,
    } = useAdminLessons();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(lessonSchema),
    });

    const openNew = () => {
        setEditing(null);

        reset({
            courseId: courses[0]?.id ?? "",
            title: "",
            type: "texto",
            content: "",
            videoUrl: "",
            order: lessons.length + 1,
            xp: 30,
        });

        setOpen(true);
    };

    const openEdit = (lesson: Lesson) => {
        setEditing(lesson);

        reset({
            courseId: lesson.courseId,
            title: lesson.title,
            type: lesson.type,
            content: lesson.content,
            videoUrl: lesson.videoUrl ?? "",
            order: lesson.order,
            xp: lesson.xp,
        });

        setOpen(true);
    };

    const onSubmit = async (data: LessonInput) => {
        try {
            if (editing) {
                await updateLesson.mutateAsync({
                    id: editing.id,
                    data,
                });

                toast.success("Aula atualizada!");
            } else {
                await createLesson.mutateAsync(data);
                toast.success("Aula criada!");
            }

            setOpen(false);
        } catch {
            toast.error("Erro ao salvar aula.");
        }
    };

    const remover = async (id: string) => {
        try {
            await deleteLesson.mutateAsync(id);
            toast.success("Aula excluída.");
        } catch {
            toast.error("Erro ao excluir aula.");
        }
    };

    const getCourseTitle = (courseId: string) =>
        courses.find((course) => course.id === courseId)?.title ?? "—";

    if (isLoading) {
        return <p className="text-muted-foreground">Carregando aulas...</p>;
    }

    if (isError) {
        return <p className="text-destructive">Erro ao carregar aulas.</p>;
    }

    return (
        <div>
            <AdminPageHeader
                actionLabel="Nova aula"
                description="Gerencie aulas vinculadas aos cursos."
                onAction={openNew}
                title="Aulas"
            />

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="p-3">Aula</th>
                                <th className="p-3">Curso</th>
                                <th className="p-3">Tipo</th>
                                <th className="p-3">Ordem</th>
                                <th className="p-3">XP</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {lessons.map((lesson) => (
                                <tr className="border-t" key={lesson.id}>
                                    <td className="p-3 font-medium">{lesson.title}</td>

                                    <td className="p-3 text-muted-foreground">
                                        {getCourseTitle(lesson.courseId)}
                                    </td>

                                    <td className="p-3">
                                        <Badge className="capitalize" variant="outline">
                                            {lesson.type}
                                        </Badge>
                                    </td>

                                    <td className="p-3">{lesson.order}</td>

                                    <td className="p-3">{lesson.xp}</td>

                                    <td className="p-3 text-right">
                                        <Button
                                            onClick={() => openEdit(lesson)}
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <Pencil size={14} />
                                        </Button>

                                        <Button
                                            className="text-destructive"
                                            onClick={() => remover(lesson.id)}
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
                        <DialogTitle>{editing ? "Editar aula" : "Nova aula"}</DialogTitle>
                    </DialogHeader>

                    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                        <Field error={errors.courseId?.message} label="Curso">
                            <Select
                                onValueChange={(value) => setValue("courseId", value)}
                                value={watch("courseId")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um curso" />
                                </SelectTrigger>

                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field error={errors.title?.message} label="Título">
                            <Input {...register("title")} />
                        </Field>

                        <div className="grid grid-cols-3 gap-3">
                            <Field error={errors.type?.message} label="Tipo">
                                <Select
                                    onValueChange={(value) =>
                                        setValue("type", value as LessonInput["type"])
                                    }
                                    value={watch("type")}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="texto">Texto</SelectItem>
                                        <SelectItem value="video">Vídeo</SelectItem>
                                        <SelectItem value="tarefa">Tarefa</SelectItem>
                                        <SelectItem value="quiz">Quiz</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field error={errors.order?.message} label="Ordem">
                                <Input
                                    type="number"
                                    {...register("order", { valueAsNumber: true })}
                                />
                            </Field>

                            <Field error={errors.xp?.message} label="XP">
                                <Input
                                    type="number"
                                    {...register("xp", { valueAsNumber: true })}
                                />
                            </Field>
                        </div>

                        <Field error={errors.content?.message} label="Conteúdo">
                            <Textarea rows={4} {...register("content")} />
                        </Field>

                        <Field
                            error={errors.videoUrl?.message}
                            label="URL do vídeo (opcional)"
                        >
                            <Input placeholder="https://..." {...register("videoUrl")} />
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
                                disabled={createLesson.isPending || updateLesson.isPending}
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
