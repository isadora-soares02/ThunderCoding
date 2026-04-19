import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireSession } from "../../middleware/require-session.js";

/**
 * Módulo de Lessons
 *
 * Rotas públicas:
 *   GET /api/lessons                  → lista todas as lessons (com filtro opcional por unit)
 *   GET /api/lessons/:id              → busca uma lesson com seus challenges e options
 *
 * Rotas protegidas (admin):
 *   POST   /api/lessons               → cria uma lesson
 *   PUT    /api/lessons/:id           → atualiza uma lesson
 *   DELETE /api/lessons/:id           → remove uma lesson
 */
export async function lessonRoutes(app: FastifyInstance) {

    // -------------------------
    // SCHEMAS DE VALIDAÇÃO
    // -------------------------

    const paramsSchema = z.object({
        id: z.string().uuid("O ID deve ser um UUID válido.")
    })

    const querySchema = z.object({
        unitId: z.string().uuid("O unitId deve ser um UUID válido.").optional()
    })

    const createLessonBodySchema = z.object({
        title: z.string().min(3, "O título precisa ter no mínimo 3 caracteres."),
        unitId: z.string().uuid("O unitId deve ser um UUID válido."),
        order: z.number().int().positive("A ordem deve ser um número inteiro positivo.")
    })

    const updateLessonBodySchema = z.object({
        title: z.string().min(3, "O título precisa ter no mínimo 3 caracteres.").optional(),
        order: z.number().int().positive("A ordem deve ser um número inteiro positivo.").optional()
    })

    // -------------------------
    // ROTAS PÚBLICAS
    // -------------------------

    /**
     * LISTAR LESSONS
     * GET /api/lessons
     * GET /api/lessons?unitId=<uuid>
     *
     * Sem filtro: retorna todas as lessons.
     * Com filtro: retorna só as lessons da unit informada, em ordem.
     */
    app.get("/", async (request, reply) => {
        const parsedQuery = querySchema.safeParse(request.query)
        if (!parsedQuery.success) {
            return reply.status(400).send({
                error: "Erro de Validação",
                issues: z.flattenError(parsedQuery.error)
            })
        }

        const lessons = await prisma.lesson.findMany({
            where: parsedQuery.data.unitId
                ? { unitId: parsedQuery.data.unitId }
                : undefined,
            orderBy: { order: "asc" }
        })

        return { items: lessons }
    })

    /**
     * BUSCAR UMA LESSON
     * GET /api/lessons/:id
     *
     * Retorna a lesson com todos os challenges e suas options em ordem.
     * Essa é a rota principal usada durante o exercício no frontend.
     */
    app.get("/:id", async (request, reply) => {
        const parsedParams = paramsSchema.safeParse(request.params)
        if (!parsedParams.success) {
            return reply.status(400).send({
                error: "Erro de Validação",
                issues: z.flattenError(parsedParams.error)
            })
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id: parsedParams.data.id },
            include: {
                challenges: {
                    orderBy: { order: "asc" },
                    include: {
                        options: {
                            orderBy: { order: "asc" }
                        }
                    }
                }
            }
        })

        if (!lesson) {
            return reply.status(404).send({
                error: "Lesson não encontrada."
            })
        }

        return lesson
    })

    // -------------------------
    // ROTAS PROTEGIDAS (admin)
    // -------------------------

    /**
     * CRIAR LESSON
     * POST /api/lessons
     *
     * Body: { title, unitId, order }
     * O unitId deve existir no banco.
     */
    app.post(
        "/",
        { preHandler: [requireSession] },
        async (request, reply) => {
            const parsedBody = createLessonBodySchema.safeParse(request.body)
            if (!parsedBody.success) {
                return reply.status(400).send({
                    error: "Erro de Validação",
                    issues: z.flattenError(parsedBody.error)
                })
            }

            const unitExists = await prisma.unit.findUnique({
                where: { id: parsedBody.data.unitId }
            })
            if (!unitExists) {
                return reply.status(404).send({
                    error: "Unit não encontrada."
                })
            }

            const lesson = await prisma.lesson.create({
                data: {
                    title: parsedBody.data.title,
                    unitId: parsedBody.data.unitId,
                    order: parsedBody.data.order
                }
            })

            return reply.status(201).send(lesson)
        }
    )

    /**
     * ATUALIZAR LESSON
     * PUT /api/lessons/:id
     *
     * Permite atualizar title e/ou order.
     */
    app.put(
        "/:id",
        { preHandler: [requireSession] },
        async (request, reply) => {
            const parsedParams = paramsSchema.safeParse(request.params)
            const parsedBody = updateLessonBodySchema.safeParse(request.body)

            if (!parsedParams.success) {
                return reply.status(400).send({
                    error: "Erro de Validação",
                    issues: z.flattenError(parsedParams.error)
                })
            }
            if (!parsedBody.success) {
                return reply.status(400).send({
                    error: "Erro de Validação",
                    issues: z.flattenError(parsedBody.error)
                })
            }

            const existingLesson = await prisma.lesson.findUnique({
                where: { id: parsedParams.data.id }
            })
            if (!existingLesson) {
                return reply.status(404).send({
                    error: "Lesson não encontrada."
                })
            }

            const updatedLesson = await prisma.lesson.update({
                where: { id: parsedParams.data.id },
                data: parsedBody.data
            })

            return updatedLesson
        }
    )

    /**
     * DELETAR LESSON
     * DELETE /api/lessons/:id
     *
     * Remove a lesson e, por cascade, todos os challenges e options ligados.
     */
    app.delete(
        "/:id",
        { preHandler: [requireSession] },
        async (request, reply) => {
            const parsedParams = paramsSchema.safeParse(request.params)
            if (!parsedParams.success) {
                return reply.status(400).send({
                    error: "Erro de Validação",
                    issues: z.flattenError(parsedParams.error)
                })
            }

            const existingLesson = await prisma.lesson.findUnique({
                where: { id: parsedParams.data.id }
            })
            if (!existingLesson) {
                return reply.status(404).send({
                    error: "Lesson não encontrada."
                })
            }

            await prisma.lesson.delete({
                where: { id: parsedParams.data.id }
            })

            return reply.status(204).send()
        }
    )
}