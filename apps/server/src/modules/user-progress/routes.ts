import { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireSession } from "../../middleware/require-session.js";

/**
 * Módulo de UserProgress
 *
 * Todas as rotas são protegidas — o usuário precisa estar logado.
 *
 *   GET   /api/user-progress          → retorna o progresso do usuário logado
 *   POST  /api/user-progress/enroll   → matricula o usuário em um curso
 *   PATCH /api/user-progress/hearts   → adiciona ou remove corações
 *   PATCH /api/user-progress/points   → adiciona pontos
 *   PATCH /api/user-progress/streak   → incrementa o streak do usuário
 */
export async function userProgressRoutes(app: FastifyInstance) {

    // -------------------------
    // SCHEMAS DE VALIDAÇÃO
    // -------------------------

    const enrollBodySchema = z.object({
        courseId: z.string().uuid("O courseId deve ser um UUID válido.")
    })

    const heartsBodySchema = z.object({
        amount: z
            .number()
            .int("O valor deve ser um inteiro.")
            .refine(v => v !== 0, "O valor não pode ser zero.")
            // Ex: -1 para perder um coração, +1 para ganhar
    })

    const pointsBodySchema = z.object({
        amount: z
            .number()
            .int("O valor deve ser um inteiro.")
            .positive("A quantidade de pontos deve ser positiva.")
    })

    // Helper para extrair o userId da sessão
    type RequestWithSession = FastifyRequest & {
        session?: { user: { id: string } }
    }

    // -------------------------
    // ROTAS PROTEGIDAS
    // -------------------------

    /**
     * BUSCAR PROGRESSO
     * GET /api/user-progress
     *
     * Retorna o progresso do usuário logado, incluindo o curso ativo.
     * Se o usuário ainda não tiver progresso, retorna null.
     */
    app.get(
        "/",
        { preHandler: [requireSession] },
        async (request: RequestWithSession, reply) => {
            const userId = request.session!.user.id

            const progress = await prisma.userProgress.findUnique({
                where: { userId },
                include: {
                    activeCourse: true
                }
            })

            if (!progress) {
                return reply.status(404).send({
                    error: "Progresso não encontrado. O usuário ainda não se matriculou em nenhum curso."
                })
            }

            return progress
        }
    )

    /**
     * MATRICULAR EM UM CURSO
     * POST /api/user-progress/enroll
     *
     * Cria o progresso do usuário se não existir, ou troca o curso ativo.
     * Body: { courseId }
     */
    app.post(
        "/enroll",
        { preHandler: [requireSession] },
        async (request: RequestWithSession, reply) => {
            const parsedBody = enrollBodySchema.safeParse(request.body)
            if (!parsedBody.success) {
                return reply.status(400).send({
                    error: "Erro de Validação",
                    issues: z.flattenError(parsedBody.error)
                })
            }

            const courseExists = await prisma.course.findUnique({
                where: { id: parsedBody.data.courseId }
            })
            if (!courseExists) {
                return reply.status(404).send({
                    error: "Curso não encontrado."
                })
            }

            const userId = request.session!.user.id

            // upsert: cria o progresso se não existir, ou atualiza o curso ativo
            const progress = await prisma.userProgress.upsert({
                where: { userId },
                create: {
                    userId,
                    activeCourseId: parsedBody.data.courseId,
                    hearts: 5,
                    points: 0,
                    streak: 0
                },
                update: {
                    activeCourseId: parsedBody.data.courseId
                },
                include: {
                    activeCourse: true
                }
            })

            return reply.status(201).send(progress)
        }
    )

    /**
     * ATUALIZAR CORAÇÕES
     * PATCH /api/user-progress/hearts
     *
     * Incrementa ou decrementa os corações do usuário.
     * Body: { amount } → ex: -1 para perder, +1 para ganhar
     *
     * Regras:
     * - Mínimo: 0 corações (não pode ficar negativo)
     * - Máximo: 5 corações (não pode passar de 5)
     */
    app.patch(
        "/hearts",
        { preHandler: [requireSession] },
        async (request: RequestWithSession, reply) => {
            const parsedBody = heartsBodySchema.safeParse(request.body)
            if (!parsedBody.success) {
                return reply.status(400).send({
                    error: "Erro de Validação",
                    issues: z.flattenError(parsedBody.error)
                })
            }

            const userId = request.session!.user.id

            const progress = await prisma.userProgress.findUnique({
                where: { userId }
            })
            if (!progress) {
                return reply.status(404).send({
                    error: "Progresso não encontrado. Matricule-se em um curso primeiro."
                })
            }

            const newHearts = Math.min(5, Math.max(0, progress.hearts + parsedBody.data.amount))

            const updated = await prisma.userProgress.update({
                where: { userId },
                data: { hearts: newHearts }
            })

            return updated
        }
    )

    /**
     * ADICIONAR PONTOS
     * PATCH /api/user-progress/points
     *
     * Soma pontos ao total do usuário.
     * Body: { amount } → ex: 10
     */
    app.patch(
        "/points",
        { preHandler: [requireSession] },
        async (request: RequestWithSession, reply) => {
            const parsedBody = pointsBodySchema.safeParse(request.body)
            if (!parsedBody.success) {
                return reply.status(400).send({
                    error: "Erro de Validação",
                    issues: z.flattenError(parsedBody.error)
                })
            }

            const userId = request.session!.user.id

            const progress = await prisma.userProgress.findUnique({
                where: { userId }
            })
            if (!progress) {
                return reply.status(404).send({
                    error: "Progresso não encontrado. Matricule-se em um curso primeiro."
                })
            }

            const updated = await prisma.userProgress.update({
                where: { userId },
                data: {
                    points: progress.points + parsedBody.data.amount
                }
            })

            return updated
        }
    )

    /**
     * INCREMENTAR STREAK
     * PATCH /api/user-progress/streak
     *
     * Incrementa o streak do usuário em +1.
     * Chamado pelo frontend ao completar uma lição no dia.
     */
    app.patch(
        "/streak",
        { preHandler: [requireSession] },
        async (request: RequestWithSession, reply) => {
            const userId = request.session!.user.id

            const progress = await prisma.userProgress.findUnique({
                where: { userId }
            })
            if (!progress) {
                return reply.status(404).send({
                    error: "Progresso não encontrado. Matricule-se em um curso primeiro."
                })
            }

            const updated = await prisma.userProgress.update({
                where: { userId },
                data: {
                    streak: progress.streak + 1
                }
            })

            return updated
        }
    )
}