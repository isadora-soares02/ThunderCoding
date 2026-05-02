import { z } from "zod";

export const createCourseSchema = z.object({
    title: z.string().min(2, "Título obrigatório"),
    description: z.string().min(5, "Descrição obrigatória"),
    language: z.string().min(1, "Linguagem obrigatória"),
    level: z.enum(["Iniciante", "Intermediário", "Avançado"]),
    duration: z.string().min(1, "Duração obrigatória"),
    xp: z.coerce.number().int().positive("XP deve ser positivo"),
    instructor: z.string().min(2, "Instrutor obrigatório").default("ThunderCoding"),
    banner: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
    status: z.enum(["rascunho", "publicado"]).default("rascunho"),
});

export const updateCourseSchema = createCourseSchema.partial();

export const courseQuerySchema = z.object({
    search: z.string().optional(),
    language: z.string().optional(),
    level: z.enum(["Iniciante", "Intermediário", "Avançado"]).optional(),
    status: z.enum(["rascunho", "publicado"]).optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseQueryInput = z.infer<typeof courseQuerySchema>;