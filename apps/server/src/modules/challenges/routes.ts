import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireSession } from "../../middleware/require-session.js";

/**
 * Módulo de Challenges
 *
 * Rotas públicas:
 *   GET /api/challenges                       → lista challenges (filtro opcional por lesson)
 *   GET /api/challenges/:id                   → busca um challenge com suas options
 *
 * Rotas protegidas (admin):
 *   POST   /api/challenges                    → cria um challenge com suas options
 *   PUT    /api/challenges/:id                → atualiza um challenge
 *   DELETE /api/challenges/:id                → remove um challenge
 *
 *   POST   /api/challenges/:id/options        → adiciona uma option a um challenge
 *   PUT    /api/challenges/options/:optionId  → atualiza uma option
 *   DELETE /api/challenges/options/:optionId  → remove uma option
 */
export async function challengeRoutes(app: FastifyInstance) {

    // -------------------------
    // SCHEMAS DE VALIDAÇÃO
    // -------------------------

    const paramsSchema = z.object({
        id: z.string().uuid("O ID deve ser um UUID válido.")
    })

    const optionParamsSchema = z.object({
        optionId: z.string().uuid("O optionId deve ser um UUID válido.")
    })

    const querySchema = z.object({
        lessonId: z.string().uuid("O lessonId deve ser um UUID válido.").optional()
    })

    const challengeOptionSchema = z.object({
        text: z.string().min(1, "O texto da opção não pode ser vazio."),
        isCorrect: z.boolean(),
        imageSrc: z.string().url("O imageSrc deve ser uma URL válida.").optional(),
        audioSrc: z.string().url("O audioSrc deve ser uma URL válida.").optional(),
        order: z.number().int().nonnegative().optional()
    })

    const createChallengeBodySchema = z.object({
        question: z.string().min(3, "A pergunta precisa ter no mínimo 3 caracteres."),
        type: z.enum(["SELECT", "ASSIST", "ORDER"]),
        lessonId: z.string().uuid("O lessonId deve ser um UUID válido."),
        order: z.number().int().positive("A ordem deve ser um número inteiro positivo."),
        // As options podem ser criadas junto com o challenge
        options: z.array(challengeOptionSchema).min(2, "Um challenge precisa ter no mínimo 2 opções.").optional()
    })

    const updateChallengeBodySchema = z.object({
        question: z.string().min(3, "A pergunta precisa ter no mínimo 3 caracteres.").optional(),
        type: z.enum(["SELECT", "ASSIST", "ORDER"]).optional(),
        order: z.number().int().positive().optional()
    })

    const updateOptionBodySchema = challengeOptionSchema.partial()

    // -------------------------
    // ROTAS PÚBLICAS
    // -------------------------

    /**
     * LISTAR CHALLENGES
     * GET /api/challenges
     * GET /api/challenges?lessonId=<uuid>
     *
     * Sem filtro: retorna todos os challenges com suas options.
     * Com filtro: retorna só os challenges da lesson informada, em ordem.
     */
    app.get("/", async (request, reply) => {
        const parsedQuery = querySchema.safeParse(request.query)
        if (!parsedQuery.success) {
            return reply.status(400).send({
                error: "Erro de Validação",
                issues: z.flattenError(parsedQuery.error)
            })
        }

        const challenges = await prisma.challenge.findMany({
            where: parsedQuery.data.lessonId
                ? { lessonId: parsedQuery.data.lessonId }
                : undefined,
            orderBy: { order: "asc" },
            include: {
                options: { orderBy: { order: "asc" } }
            }
        })

        return { items: challenges }
    })

    /**
     * BUSCAR UM CHALLENGE
     * GET /api/challenges/:id
     *
     * Retorna o challenge com todas as suas options em ordem.
     */
    app.get("/:id", async (request, reply) => {
        const parsedParams = paramsSchema.safeParse(request.params)
        if (!parsedParams.success) {
            return reply.status(400).send({
                error: "Erro de Validação",
                issues: z.flattenError(parsedParams.error)
            })
        }

        const challenge = await prisma.challenge.findUnique({
            where: { id: parsedParams.data.id },
            include: {
                options: { orderBy: { order: "asc" } }
            }
        })

        if (!challenge) {
            return reply.status(404).send({
                error: "Challenge não encontrado."
            })
        }

        return challenge
    })

    // -------------------------
    // ROTAS PROTEGIDAS (admin)
    // -------------------------

    /**
     * CRIAR CHALLENGE
     * POST /api/challenges
     *
     * Cria o challenge e suas options em uma única requisição.
     * Body: { question, type, lessonId, order, options? }
     *
     * Atenção: para o tipo ORDER, certifique-se de que as options
     * tenham o campo "order" definido para garantir a sequência correta.
     */
    app.post(
        "/",
        { preHandler: [requireSession] },
        async (request, reply) => {
            const parsedBody = createChallengeBodySchema.safeParse(request.body)
            if (!parsedBody.success) {
                return reply.status(400).send({
                    error: "Erro de Validação",
                    issues: z.flattenError(parsedBody.error)
                })
            }

            const lessonExists = await prisma.lesson.findUnique({
                where: { id: parsedBody.data.lessonId }
            })
            if (!lessonExists) {
                return reply.status(404).send({
                    error: "Lesson não encontrada."
                })
            }

            const challenge = await prisma.challenge.create({
                data: {
                    question: parsedBody.data.question,
                    type: parsedBody.data.type,
                    lessonId: parsedBody.data.lessonId,
                    order: parsedBody.data.order,
                    options: parsedBody.data.options
                        ? { create: parsedBody.data.options }
                        : undefined
                },
                include: {
                    options: { orderBy: { order: "asc" } }
                }
            })

            return reply.status(201).send(challenge)
        }
    )

    /**
     * ATUALIZAR CHALLENGE
     * PUT /api/challenges/:id
     *
     * Atualiza question, type e/ou order.
     * Para gerenciar as options, use as rotas de options abaixo.
     */
    app.put(
        "/:id",
        { preHandler: [requireSession] },
        async (request, reply) => {
            const parsedParams = paramsSchema.safeParse(request.params)
            const parsedBody = updateChallengeBodySchema.safeParse(request.body)

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

            const existingChallenge = await prisma.challenge.findUnique({
                where: { id: parsedParams.data.id }
            })
            if (!existingChallenge) {
                return reply.status(404).send({
                    error: "Challenge não encontrado."
                })
            }

            const updatedChallenge = await prisma.challenge.update({
                where: { id: parsedParams.data.id },
                data: parsedBody.data,
                include: {
                    options: { orderBy: { order: "asc" } }
                }
            })

            return updatedChallenge
        }
    )

    /**
     * DELETAR CHALLENGE
     * DELETE /api/challenges/:id
     *
     * Remove o challenge e, por cascade, todas as options e progressos ligados.
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

            const existingChallenge = await prisma.challenge.findUnique({
                where: { id: parsedParams.data.id }
            })
            if (!existingChallenge) {
                return reply.status(404).send({
                    error: "Challenge não encontrado."
                })
            }

            await prisma.challenge.delete({
                where: { id: parsedParams.data.id }
            })

            return reply.status(204).send()
        }
    )

    // -------------------------
    // ROTAS DE OPTIONS (admin)
    // -------------------------

    /**
     * ADICIONAR OPTION A UM CHALLENGE
     * POST /api/challenges/:id/options
     *
     * Adiciona uma nova opção a um challenge existente.
     * Body: { text, isCorrect, imageSrc?, audioSrc?, order? }
     */
    app.post(
        "/:id/options",
        { preHandler: [requireSession] },
        async (request, reply) => {
            const parsedParams = paramsSchema.safeParse(request.params)
            const parsedBody = challengeOptionSchema.safeParse(request.body)

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

            const challengeExists = await prisma.challenge.findUnique({
                where: { id: parsedParams.data.id }
            })
            if (!challengeExists) {
                return reply.status(404).send({
                    error: "Challenge não encontrado."
                })
            }

            const option = await prisma.challengeOption.create({
                data: {
                    ...parsedBody.data,
                    challengeId: parsedParams.data.id
                }
            })

            return reply.status(201).send(option)
        }
    )

    /**
     * ATUALIZAR OPTION
     * PUT /api/challenges/options/:optionId
     *
     * Atualiza qualquer campo de uma option existente.
     */
    app.put(
        "/options/:optionId",
        { preHandler: [requireSession] },
        async (request, reply) => {
            const parsedParams = optionParamsSchema.safeParse(request.params)
            const parsedBody = updateOptionBodySchema.safeParse(request.body)

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

            const existingOption = await prisma.challengeOption.findUnique({
                where: { id: parsedParams.data.optionId }
            })
            if (!existingOption) {
                return reply.status(404).send({
                    error: "Option não encontrada."
                })
            }

            const updatedOption = await prisma.challengeOption.update({
                where: { id: parsedParams.data.optionId },
                data: parsedBody.data
            })

            return updatedOption
        }
    )

    /**
     * DELETAR OPTION
     * DELETE /api/challenges/options/:optionId
     */
    app.delete(
        "/options/:optionId",
        { preHandler: [requireSession] },
        async (request, reply) => {
            const parsedParams = optionParamsSchema.safeParse(request.params)
            if (!parsedParams.success) {
                return reply.status(400).send({
                    error: "Erro de Validação",
                    issues: z.flattenError(parsedParams.error)
                })
            }

            const existingOption = await prisma.challengeOption.findUnique({
                where: { id: parsedParams.data.optionId }
            })
            if (!existingOption) {
                return reply.status(404).send({
                    error: "Option não encontrada."
                })
            }

            await prisma.challengeOption.delete({
                where: { id: parsedParams.data.optionId }
            })

            return reply.status(204).send()
        }
    )
}