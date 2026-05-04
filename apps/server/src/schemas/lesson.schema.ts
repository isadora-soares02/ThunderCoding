import { z } from "zod";

export const createLessonSchema = z.object({
    courseId: z.string().min(1),
    title: z.string().min(2),
    type: z.enum(["texto", "video", "tarefa", "quiz"]),
    content: z.string().min(1),
    videoUrl: z.string().optional().nullable(),
    order: z.coerce.number().int().nonnegative(),
    xp: z.coerce.number().int().positive(),
    durationMin: z.coerce.number().int().positive().default(5),
    taskId: z.string().optional().nullable(),
    questionId: z.string().optional().nullable()
})

export const updateLessonSchema = createLessonSchema.partial();

export type CreateLessonInput = z.infer<typeof createLessonSchema>;