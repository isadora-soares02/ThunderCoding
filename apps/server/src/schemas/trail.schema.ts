import { z } from "zod";

export const createTrailSchema = z.object({
    name: z.string().min(2, "Nome obrigatório"),
    description: z.string().min(5, "Descrição obrigatória"),
    level: z.enum(["Iniciante", "Intermediário", "Avançado"]),
    courseIds: z.array(z.string().min(1)).default([]),
    totalXp: z.coerce.number().int().positive("XP deve ser positivo"),
    progress: z.coerce.number().int().min(0).max(100).default(0),
    status: z.enum(["rascunho", "publicado"]).default("rascunho"),
    color: z.string().optional().nullable(),
    icon: z.string().optional().nullable(),
});

export const updateTrailSchema = createTrailSchema.partial();

export const trailQuerySchema = z.object({
    search: z.string().optional(),
    level: z.enum(["Iniciante", "Intermediário", "Avançado"]).optional(),
    status: z.enum(["rascunho", "publicado"]).optional(),
});

export type CreateTrailInput = z.infer<typeof createTrailSchema>;
export type UpdateTrailInput = z.infer<typeof updateTrailSchema>;
export type TrailQueryInput = z.infer<typeof trailQuerySchema>;