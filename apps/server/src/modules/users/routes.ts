import { FastifyInstance } from "fastify";
import { requireSession } from "../../middleware/require-session.js";

/**
 * Exemplo de módulo real:
 * - prefixo /users
 * - rota pública e rota protegida
 */
export async function userRoutes(app: FastifyInstance) {
    /**
     * Rota protegida:
     * somente usuário logado pode acessar.
     */
    app.get(
        "/me",
        {
            preHandler: [requireSession]
        },
        async (request) => {
            const session = (request as typeof request & { session?: unknown }).session

            return {
                message: "Usuário autenticado com sucesso",
                session
            }
        }
    )
}