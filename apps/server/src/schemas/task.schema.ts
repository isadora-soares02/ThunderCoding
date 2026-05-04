import { z } from "zod";

export const createTaskSchema = z.object({
    courseId: z.string().min(1, "Curso obrigatório"),
    title: z.string().min(2, "Título obrigatório"),
    description: z.string().min(5, "Descrição obrigatória"),
    objective: z.string().min(3, "Objetivo obrigatório"),
    xp: z.coerce.number().int().positive("XP deve ser positivo"),
    estimatedTime: z.string().min(1, "Tempo estimado obrigatório"),
    requirements: z.array(z.string().min(1)).min(1, "Informe pelo menos um requisito"),
});

export const updateTaskSchema = createTaskSchema.partial();

export const submitTaskSchema = z.object({
    answer: z.string().min(3, "Envie uma resposta válida"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type SubmitTaskInput = z.infer<typeof submitTaskSchema>;