import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
    password: z.string().min(1, "Senha obrigatória"),
});

export const registerSchema = z
    .object({
        name: z.string().min(2, "Nome obrigatório"),
        email: z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
        password: z.string().min(6, "Mínimo de 6 caracteres"),
        confirmPassword: z.string().min(1, "Confirme sua senha"),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmar"],
    });

export const courseSchema = z.object({
    title: z.string().min(2, "Título obrigatório"),
    description: z.string().min(5, "Descrição obrigatória"),
    language: z.string().min(1, "Linguagem obrigatória"),
    level: z.enum(["Iniciante", "Intermediário", "Avançado"], { message: "Nível obrigatório" }),
    duration: z.string().min(1, "Duração obrigatória"),
    xp: z.coerce.number().positive("XP deve ser positivo"),
    banner: z.string().url("URL inválida").or(z.literal("")).optional(),
    status: z.enum(["rascunho", "publicado"]),
});

export const trailSchema = z.object({
    name: z.string().min(2, "Nome obrigatório"),
    description: z.string().min(5, "Descrição obrigatória"),
    level: z.enum(["Iniciante", "Intermediário", "Avançado"]),
    totalXp: z.coerce.number().positive("XP deve ser positivo"),
    status: z.enum(["rascunho", "publicado"]),
});

export const lessonSchema = z.object({
    courseId: z.string().min(1, "Curso obrigatório"),
    title: z.string().min(2, "Título obrigatório"),
    type: z.enum(["texto", "video", "tarefa", "quiz"]),
    content: z.string().min(1, "Conteúdo obrigatório"),
    videoUrl: z.string().url().or(z.literal("")).optional(),
    order: z.coerce.number().int().nonnegative(),
    xp: z.coerce.number().positive(),
});

export const questionSchema = z.object({
    courseId: z.string().min(1, "Curso obrigatório"),
    question: z.string().min(3, "Pergunta obrigatória"),
    a: z.string().min(1, "Alternativa A obrigatória"),
    b: z.string().min(1, "Alternativa B obrigatória"),
    c: z.string().min(1, "Alternativa C obrigatória"),
    d: z.string().min(1, "Alternativa D obrigatória"),
    correct: z.enum(["a", "b", "c", "d"]),
    explanation: z.string().min(1, "Explicação obrigatória"),
    xp: z.coerce.number().positive(),
    difficulty: z.enum(["Iniciante", "Intermediário", "Avançado"]),
});

export const achievementSchema = z.object({
    name: z.string().min(2, "Nome obrigatório"),
    description: z.string().min(5, "Descrição obrigatória"),
    icon: z.string().min(1, "Ícone obrigatório"),
    criterion: z.string().min(1, "Critério obrigatório"),
    xpBonus: z.coerce.number().nonnegative(),
    status: z.enum(["rascunho", "publicado"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type TrailInput = z.infer<typeof trailSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type AchievementInput = z.infer<typeof achievementSchema>;
