import { FastifyReply, FastifyRequest } from "fastify";
import { auth } from "../lib/auth.js";

/**
 * Middleware simples para rotas protegidas.
 * 
 * Como funciona:
 * - repassa os headers da requisição para o Better Auth
 * - tenta obter a sessão atual
 * - se não houver sessão, bloqueia com 401
 * 
 * Observação:
 * dependendo do cliente/front, o cookie de sessão precisa
 * ser enviado corretamente.
 */
export async function requireSession(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const headers = new Headers()

    for (const [key, value] of Object.entries(request.headers)) {
        if (!value) { continue }

        if (Array.isArray(value)) {
            for (const item of value) { headers.append(key, item) }
        } else {
            headers.append(key, String(value))
        }
    }

    const session = await auth.api.getSession({
        headers
    })

    if (!session) {
        return reply.status(401).send({
            error: "Unauthorized",
            message: "Você precisa estar autenticado para acessar essa rota."
        })
    }

    /**
     * Guardamos a sessão no request para uso posterior.
     */
    (request as FastifyRequest & { session?: unknown }).session = session
}