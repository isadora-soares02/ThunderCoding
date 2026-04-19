import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireSession } from "../../middleware/require-session.js";

/**
 * Módulo de Courses
 *
 * Rotas públicas:
 *   GET /api/courses        → lista todos os cursos
 *   GET /api/courses/:id    → busca um curso com suas units
 *
 * Rotas protegidas (admin):
 *   POST   /api/courses        → cria um curso
 *   PUT    /api/courses/:id    → atualiza um curso
 *   DELETE /api/courses/:id    → remove um curso
 */
export async function courseRoutes(app: FastifyInstance) {

    // -------------------------
    // SCHEMAS DE VALIDAÇÃO
    // -------------------------

    const paramsSchema = z.object({
        id: z.string().uuid("O ID deve ser um UUID válido.")
    })

    const createCourseBodySchema = z.object({
        title: z.string().min(3, "O título precisa ter no mínimo 3 caracteres."),
        imageSrc: z.string().url("O imageSrc deve ser uma URL válida.")
    })

    const updateCourseBodySchema = z.object({
        title: z.string().min(3, "O título precisa ter no mínimo 3 caracteres.").optional(),
        imageSrc: z.string().url("O imageSrc deve ser uma URL válida.").optional()
    })

    // -------------------------
    // ROTAS PÚBLICAS
    // -------------------------

    /**
     * LISTAR CURSOS
     * GET /api/courses
     *
     * Retorna todos os cursos disponíveis.
     * Público: qualquer pessoa pode ver os cursos antes de se logar.
     */
    app.get("/", async () => {
        const courses = await prisma.course.findMany({
            orderBy: {
                title: "asc"
            }
        })

        return { items: courses }
    })

    /**
     * BUSCAR UM CURSO
     * GET /api/courses/:id
     *
     * Retorna o curso com suas units em ordem.
     * Útil para montar a tela de trilha de aprendizagem.
     */
    app.get("/:id", async (request, reply) => {
        const parsedParams = paramsSchema.safeParse(request.params)
        if (!parsedParams.success) {
            return reply.status(400).send({
                error: "Erro de Validação",
                issues: z.flattenError(parsedParams.error)
            })
        }

        const course = await prisma.course.findUnique({
            where: {
                id: parsedParams.data.id
            },
            include: {
                units: {
                    orderBy: {
                        order: "asc"
                    },
                    include: {
                        lessons: {
                            orderBy: {
                                order: "asc"
                            }
                        }
                    }
                }
            }
        })

        if (!course) {
            return reply.status(404).send({
                error: "Curso não encontrado."
            })
        }

        return course
    })

    // -------------------------
    // ROTAS PROTEGIDAS (admin)
    // -------------------------

    /**
     * CRIAR CURSO
     * POST /api/courses
     *
     * Apenas usuários autenticados podem criar cursos.
     * Body: { title, imageSrc }
     */
    app.post(
        "/",
        { preHandler: [requireSession] },
        async (request, reply) => {
            const parsedBody = createCourseBodySchema.safeParse(request.body)
            if (!parsedBody.success) {
                return reply.status(400).send({
                    error: "Erro de Validação",
                    issues: z.flattenError(parsedBody.error)
                })
            }

            const course = await prisma.course.create({
                data: {
                    title: parsedBody.data.title,
                    imageSrc: parsedBody.data.imageSrc
                }
            })

            return reply.status(201).send(course)
        }
    )

    /**
     * ATUALIZAR CURSO
     * PUT /api/courses/:id
     *
     * Atualiza title e/ou imageSrc de um curso existente.
     */
    app.put(
        "/:id",
        { preHandler: [requireSession] },
        async (request, reply) => {
            const parsedParams = paramsSchema.safeParse(request.params)
            const parsedBody = updateCourseBodySchema.safeParse(request.body)

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

            const existingCourse = await prisma.course.findUnique({
                where: { id: parsedParams.data.id }
            })
            if (!existingCourse) {
                return reply.status(404).send({
                    error: "Curso não encontrado."
                })
            }

            const updatedCourse = await prisma.course.update({
                where: { id: parsedParams.data.id },
                data: parsedBody.data
            })

            return updatedCourse
        }
    )

    /**
     * DELETAR CURSO
     * DELETE /api/courses/:id
     *
     * Remove o curso e, por cascade, todas as units/lessons/challenges ligados.
     * Cuidado: ação irreversível!
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

            const existingCourse = await prisma.course.findUnique({
                where: { id: parsedParams.data.id }
            })
            if (!existingCourse) {
                return reply.status(404).send({
                    error: "Curso não encontrado."
                })
            }

            await prisma.course.delete({
                where: { id: parsedParams.data.id }
            })

            return reply.status(204).send()
        }
    )
}