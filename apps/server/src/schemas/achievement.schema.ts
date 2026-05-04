import { z } from "zod";

export const createAchievementSchema = z.object({
    name: z.string().min(2, "Nome obrigatório"),
    description: z.string().min(5, "Descrição obrigatória"),
    icon: z.string().min(1, "Ícone obrigatório"),
    criterion: z.string().min(1, "Critério obrigatório"),
    xpBonus: z.coerce.number().int().nonnegative("XP bônus não pode ser negativo"),
    status: z.enum(["rascunho", "publicado"]).default("publicado"),
});

export const updateAchievementSchema = createAchievementSchema.partial();

export type CreateAchievementInput = z.infer<typeof createAchievementSchema>;
export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>;