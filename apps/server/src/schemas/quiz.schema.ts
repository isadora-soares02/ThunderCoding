import { z } from "zod";

export const answerQuestionSchema = z.object({
    questionId: z.string().min(1),
    answer: z.enum(["a", "b", "c", "d"]),
});

export const createQuestionSchema = z.object({
    courseId: z.string().min(1),
    question: z.string().min(3),
    a: z.string().min(1),
    b: z.string().min(1),
    c: z.string().min(1),
    d: z.string().min(1),
    correct: z.enum(["a", "b", "c", "d"]),
    explanation: z.string().min(1),
    xp: z.coerce.number().positive(),
    difficulty: z.enum(["Iniciante", "Intermediário", "Avançado"]),
});

export const updateQuestionSchema = createQuestionSchema.partial();