import { fromNodeHeaders } from "better-auth/node";
import type { FastifyReply, FastifyRequest } from "fastify";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export function getSession(request: FastifyRequest) {
    return auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
    });
}

export async function requireAuth(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const session = await getSession(request);

    if (!session?.user.id) {
        return reply.status(401).send({
            message: "Você precisa estar autenticado.",
        });
    }

    request.user = {
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name ?? "",
    };
}

export async function requireAdmin(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const session = await getSession(request);

    if (!session?.user.id) {
        return reply.status(401).send({
            message: "Você precisa estar autenticado.",
        });
    }

    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        },
    });

    if (!user || user.role !== "ADMIN") {
        return reply.status(403).send({
            message: "Acesso permitido apenas para administradores.",
        });
    }

    request.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    };
}
