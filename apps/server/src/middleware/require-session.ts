import type { FastifyReply, FastifyRequest } from "fastify";
import { auth } from "../lib/auth";

export async function requireSession(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const headers = new Headers();

    for (const [key, value] of Object.entries(request.headers)) {
        if (!value) {
            continue;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                headers.append(key, item);
            }
        } else {
            headers.append(key, String(value));
        }
    }

    const session = await auth.api.getSession({
        headers,
    });

    if (!session) {
        return reply.status(401).send({
            error: "Unauthorized",
            message: "Você precisa estar autenticado para acessar essa rota.",
        });
    }

    (request as FastifyRequest & { session?: unknown }).session = session;
}
