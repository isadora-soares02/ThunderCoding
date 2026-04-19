import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireSession } from "../../middleware/require-session.js";

/**
 * Módulo de Units
 *
 * Rotas públicas:
 *   GET /api/units                    → lista todas as units (com filtro opcional por curso)
 *   GET /api/units/:id                → busca uma unit com suas lessons
 *
 * Rotas protegidas (admin):
 *   POST   /api/units                 → cria uma unit
 *   PUT    /api/units/:id             → atualiza uma unit
 *   DELETE /api/units/:id             → remove uma unit
 */
export async function unitRoutes(app: FastifyInstance) {

    // -------------------------
    // SCHEMAS DE VALIDAÇÃO
    // -------------------------

    const paramsSchema = z.object({
        id: z.string().uuid("O ID deve ser um UUID válido.")
    })

    const querySchema = z.object({
        courseId: z.string().uuid("O courseId deve ser um UUID válido.").optional()
    })

    const createUnitBodySchema = z.object({
        title: z.string().min(3, "O título precisa ter no mínimo 3 caracteres."),
        description: z.string().min(3, "A descrição precisa ter no mínimo 3 caracteres."),
        courseId: z.string().uuid("O courseId deve ser um UUID válido."),
        order: z.number().int().positive("A ordem deve ser um número inteiro positivo.")
    })

    const updateUnitBodySchema = z.object({
        title: z.string().min(3, "O título precisa ter no mínimo 3 caracteres.").optional(),
        description: z.string().min(3, "A descrição precisa ter no mínimo 3 caracteres.").optional(),
        order: z.number().int().positive("A ordem deve ser um número inteiro positivo.").optional()
    })

    // -------------------------
    // ROTAS PÚBLICAS
    // -------------------------

    /**
     * LISTAR UNITS
     * GET /api/units
     * GET /api/units?courseId=<uuid>
     *
     * Sem filtro: retorna todas as units.
     * Com filtro: retorna só as units do curso informado, em ordem.
     */
    app.get("/", async (request, reply) => {
        const parsedQuery = querySchema.safeParse(request.query)
        if (!parsedQuery.success) {
            return reply.status(400).send({
                error: "Erro de Validação",
                issues: z.flattenError(parsedQuery.error)
            })
        }

        const units = await prisma.unit.findMany({
            where: parsedQuery.data.courseId
                ? { courseId: parsedQuery.data.courseId }
                : undefined,
            orderBy: { order: "asc" },
            include: {
                lessons: {
                    orderBy: { order: "asc" }
                }
            }
        })

        return { items: units }
    })

    /**
     * BUSCAR UMA UNIT
     * GET /api/units/:id
     *
     * Retorna a unit com suas lessons em ordem.
     */
    app.get("/:id", async (request, reply) => {
        const parsedParams = paramsSchema.safeParse(request.params)
        if (!parsedParams.success) {
            return reply.status(400).send({
                error: "Erro de Validação",
                issues: z.flattenError(parsedParams.error)
            })
        }

        const unit = await prisma.unit.findUnique({
            where: { id: parsedParams.data.id },
            include: {
                lessons: {
                    orderBy: { order: "asc" }
                }
            }
        })

        if (!unit) {
            return reply.status(404).send({
                error: "Unit não encontrada."
            })
        }

        return unit
    })

    // -------------------------
    // ROTAS PROTEGIDAS (admin)
    // -------------------------

    /**
     * CRIAR UNIT
     * POST /api/units
     *
     * Body: { title, description, courseId, order }
     * O courseId deve existir no banco.
     */
    app.post(
        "/",
        { preHandler: [requireSession] },
        async (request, reply) => {
            const parsedBody = createUnitBodySchema.safeParse(request.body)
            if (!parsedBody.success) {
                return reply.status(400).send({
                    error: "Erro de Validação",
                    issues: z.flattenError(parsedBody.error)
                })
            }

            // Verifica se o curso existe antes de criar a unit
            const courseExists = await prisma.course.findUnique({
                where: { id: parsedBody.data.courseId }
            })
            if (!courseExists) {
                return reply.status(404).send({
                    error: "Curso não encontrado."
                })
            }

            const unit = await prisma.unit.create({
                data: {
                    title: parsedBody.data.title,
                    description: parsedBody.data.description,
                    courseId: parsedBody.data.courseId,
                    order: parsedBody.data.order
                }
            })

            return reply.status(201).send(unit)
        }
    )

    /**
     * ATUALIZAR UNIT
     * PUT /api/units/:id
     *
     * Permite atualizar title, description e/ou order.
     * Não permite trocar o courseId (para isso, delete e recrie).
     */
    app.put(
        "/:id",
        { preHandler: [requireSession] },
        async (request, reply) => {
            const parsedParams = paramsSchema.safeParse(request.params)
            const parsedBody = updateUnitBodySchema.safeParse(request.body)

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

            const existingUnit = await prisma.unit.findUnique({
                where: { id: parsedParams.data.id }
            })
            if (!existingUnit) {
                return reply.status(404).send({
                    error: "Unit não encontrada."
                })
            }

            const updatedUnit = await prisma.unit.update({
                where: { id: parsedParams.data.id },
                data: parsedBody.data
            })

            return updatedUnit
        }
    )

    /**
     * DELETAR UNIT
     * DELETE /api/units/:id
     *
     * Remove a unit e, por cascade, todas as lessons/challenges ligados.
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

            const existingUnit = await prisma.unit.findUnique({
                where: { id: parsedParams.data.id }
            })
            if (!existingUnit) {
                return reply.status(404).send({
                    error: "Unit não encontrada."
                })
            }

            await prisma.unit.delete({
                where: { id: parsedParams.data.id }
            })

            return reply.status(204).send()
        }
    )
}