import { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireSession } from "../../middleware/require-session.js";

/**
 * Módulo de ChallengeProgress
 *
 * Todas as rotas são protegidas — o usuário precisa estar logado.
 *
 *   POST /api/challenge-progress               → marca um challenge como completado
 *   GET  /api/challenge-progress/lesson/:id    → retorna quais challenges de uma lesson o usuário já completou
 */
export async function challengeProgressRoutes(app: FastifyInstance) {

    // -------------------------
    // SCHEMAS DE VALIDAÇÃO
    // -------------------------

    const lessonParamsSchema = z.object({
        id: z.string().uuid("O ID deve ser um UUID válido.")
    })

    const completeBodySchema = z.object({
        challengeId: z.string().uuid("O challengeId deve ser um UUID válido."),
        // Pontos a somar ao progresso do usuário ao completar o challenge
        // Opcional: se não informado, usa o valor padrão de 10
        points: z.number().int().positive().default(10).optional()
    })

    // Helper para extrair o userId da sessão
    type RequestWithSession = FastifyRequest & {
        session?: { user: { id: string } }
    }

    // -------------------------
    // ROTAS PROTEGIDAS
    // -------------------------

    /**
     * COMPLETAR UM CHALLENGE
     * POST /api/challenge-progress
     *
     * Marca o challenge como completado para o usuário logado.
     * Se já existir um registro, apenas garante que completed=true.
     * Também soma os pontos ao UserProgress automaticamente.
     *
     * Body: { challengeId, points? }
     */
    app.post(
        "/",
        { preHandler: [requireSession] },
        async (request: RequestWithSession, reply) => {
            const parsedBody = completeBodySchema.safeParse(request.body)
            if (!parsedBody.success) {
                return reply.status(400).send({
                    error: "Erro de Validação",
                    issues: z.flattenError(parsedBody.error)
                })
            }

            const userId = request.session!.user.id
            const { challengeId, points = 10 } = parsedBody.data

            // Verifica se o challenge existe
            const challengeExists = await prisma.challenge.findUnique({
                where: { id: challengeId }
            })
            if (!challengeExists) {
                return reply.status(404).send({
                    error: "Challenge não encontrado."
                })
            }

            // Verifica se o usuário já completou esse challenge
            const existing = await prisma.challengeProgress.findFirst({
                where: { userId, challengeId }
            })

            if (existing?.completed) {
                return reply.status(409).send({
                    error: "Challenge já completado.",
                    message: "Esse challenge já foi marcado como completado pelo usuário."
                })
            }

            // Verifica se o usuário tem progresso (precisa estar matriculado)
            const userProgress = await prisma.userProgress.findUnique({
                where: { userId }
            })
            if (!userProgress) {
                return reply.status(404).send({
                    error: "Progresso não encontrado. Matricule-se em um curso primeiro."
                })
            }

            // Verifica se o usuário tem corações para continuar
            if (userProgress.hearts <= 0) {
                return reply.status(403).send({
                    error: "Sem corações.",
                    message: "O usuário não tem corações suficientes para completar o challenge."
                })
            }

            // Usa uma transaction para garantir que o progresso e os pontos
            // sejam salvos juntos — se um falhar, o outro desfaz também
            const [challengeProgress] = await prisma.$transaction([
                // Cria ou atualiza o progresso do challenge
                existing
                    ? prisma.challengeProgress.update({
                        where: { id: existing.id },
                        data: { completed: true }
                    })
                    : prisma.challengeProgress.create({
                        data: {
                            userId,
                            challengeId,
                            completed: true
                        }
                    }),

                // Soma os pontos ao UserProgress
                prisma.userProgress.update({
                    where: { userId },
                    data: {
                        points: userProgress.points + points
                    }
                })
            ])

            return reply.status(201).send(challengeProgress)
        }
    )

    /**
     * BUSCAR PROGRESSO DE UMA LESSON
     * GET /api/challenge-progress/lesson/:id
     *
     * Retorna quais challenges de uma lesson o usuário já completou.
     * Útil para o frontend saber quais exercícios pular ou marcar como feitos.
     */
    app.get(
        "/lesson/:id",
        { preHandler: [requireSession] },
        async (request: RequestWithSession, reply) => {
            const parsedParams = lessonParamsSchema.safeParse(request.params)
            if (!parsedParams.success) {
                return reply.status(400).send({
                    error: "Erro de Validação",
                    issues: z.flattenError(parsedParams.error)
                })
            }

            const userId = request.session!.user.id

            // Verifica se a lesson existe
            const lessonExists = await prisma.lesson.findUnique({
                where: { id: parsedParams.data.id }
            })
            if (!lessonExists) {
                return reply.status(404).send({
                    error: "Lesson não encontrada."
                })
            }

            // Busca todos os challenges da lesson que o usuário completou
            const completedChallenges = await prisma.challengeProgress.findMany({
                where: {
                    userId,
                    completed: true,
                    challenge: {
                        lessonId: parsedParams.data.id
                    }
                },
                include: {
                    challenge: true
                }
            })

            return { items: completedChallenges }
        }
    )
}