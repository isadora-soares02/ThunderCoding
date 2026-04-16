import { FastifyInstance } from "fastify";
import { z } from "zod"
import { prisma } from "../../lib/prisma.js";
import { requireSession } from "../../middleware/require-session.js";
import { request } from "node:http";

/**
 * Este módulo mostra um CRUD completo de exemplo.
 * 
 * Ele foi pensado para ser o "modelo oficial" do projeto.
 * - rota pública
 * - rota protegida
 * - validação com Zod
 * - uso do Prisma
 * - comentários
 */
export async function exampleRoutes(app: FastifyInstance) {
    /**
     * SCHEMAS DE VALIDAÇÃO
     * 
     * Criamos os schemas uma vez e reutilizamos.
     * Isso deixa o código mais organizado.
     */
    const paramsSchema = z.object({
        id: z.string().min(1, "O ID é obrigatório.")
    })

    const createExampleBodySchema = z.object({
        title: z.string().min(3, "O título precisa ter no mínimo 3 caracteres."),
        description: z.string().optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]),
        isPublished: z.boolean().default(true).optional()
    })

    const updateExampleBodySchema = z.object({
        title: z.string().min(3, "O título precisa ter no mínimo 3 caracteres.").optional(),
        description: z.string().optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        isPublished: z.boolean().default(true).optional()
    })

    /**
     * ROTA PÚBLICA - LISTAR EXEMPLOS PUBLICADOS
     * GET /api/examples
     * 
     * Esta rota é pública porque qualquer pessoa pode
     * visualizar as trilhas disponíveis
     */
    app.get("/", async () => {
        const examples = await prisma.example.findMany({
            where: {
                isPublished: true
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return {
            items: examples
        }
    })

    /**
     * ROTA PÚBLICA - BUSCAR UM EXEMPLO PUBLICADO
     * GET /api/examples/:id
     */
    app.get("/:id", async (request, reply) => {
        const parsedParams = paramsSchema.safeParse(request.params)
        if (!parsedParams.success) {
            return reply.status(400).send({
                error: "Erro de Validação",
                issues: z.flattenError(parsedParams.error)
            })
        }

        const example = await prisma.example.findFirst({
            where: {
                id: parsedParams.data.id,
                isPublished: true
            }
        })
        if (!example) {
            return reply.status(404).send({
                error: "Exemplo não encontrado."
            })
        }

        return example
    })

    /**
     * ROTA PROTEGIDA - LISTAR TUDO (inclusive rascunhos)
     * GET /api/examples/admin/all
     * 
     * Aqui o usuário precisa estar autenticado.
     */
    app.get(
        "/admin/all",
        {
            preHandler: [requireSession]
        },
        async () => {
            const examples = await prisma.example.findMany({
                orderBy: {
                    createdAt: "desc"
                }
            })

            return {
                items: examples
            }
        }
    )

    /**
     * ROTA PROTEGIDA - CRIAR EXEMPLO
     * POST /api/examples
     */
    app.post(
        "/",
        {
            preHandler: [requireSession]
        },
        async (request, reply) => {
            const parsedBody = createExampleBodySchema.safeParse(request.body)
            if (!parsedBody.success) {
                return reply.status(400).send({
                    error: "Erro de Validação",
                    issues: z.flattenError(parsedBody.error)
                })
            }

            const example = await prisma.example.create({
                data: {
                    title: parsedBody.data.title,
                    description: parsedBody.data.description,
                    level: parsedBody.data.level,
                    isPublished: parsedBody.data.isPublished ?? true
                }
            })

            return reply.status(201).send(example)
        }
    )

    /**
     * ROTA PROTEFIDA - ATUALIZAR EXEMPLO
     * PUT /api/examples/:id
     */
    app.put(
        "/:id",
        {
            preHandler: [requireSession]
        },
        async (request, reply) => {
            const parsedParams = paramsSchema.safeParse(request.params)
            const parsedBody = updateExampleBodySchema.safeParse(request.body)
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

            const existingExample = await prisma.example.findUnique({
                where: {
                    id: parsedParams.data.id
                }
            })
            if (!existingExample) {
                return reply.status(404).send({
                    error: "Exemplo não encontrado."
                })
            }

            const updatedExample = await prisma.example.update({
                where: {
                    id: parsedParams.data.id
                },
                data: parsedBody.data
            })

            return updatedExample
        }
    )

    /**
     * ROTA PROTEGIDA - REMOVER EXEMPLO
     * DELETE /api/examples/:id
     */
    app.delete(
        "/:id",
        {
            preHandler: [requireSession]
        },
        async (request, reply) => {
            const parsedParams = paramsSchema.safeParse(request.params)
            if (!parsedParams.success) {
                return reply.status(400).send({
                    error: "Erro de Validação",
                    issues: z.flattenError(parsedParams.error)
                })
            }

            const existingExample = await prisma.example.findUnique({
                where: {
                    id: parsedParams.data.id
                }
            })
            if (!existingExample) {
                return reply.status(404).send({
                    error: "Exemplo não encontrado."
                })
            }

            await prisma.example.delete({
                where: {
                    id: parsedParams.data.id
                }
            })

            return reply.status(204).send()
        }
    )
}