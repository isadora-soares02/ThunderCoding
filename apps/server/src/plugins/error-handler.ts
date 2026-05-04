import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";

export function errorHandler(app: FastifyInstance) {
    app.setErrorHandler((error, _request, reply) => {
        app.log.error(error);

        if (error instanceof ZodError) {
            return reply.status(400).send({
                message: "Erro de validação.",
                errors: error.flatten().fieldErrors,
            });
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return reply.status(409).send({
                    message: "Já existe um registro com esses dados.",
                });
            }

            if (error.code === "P2025") {
                return reply.status(404).send({
                    message: "Registro não encontrado.",
                });
            }
        }

        if (error instanceof Error && error.message.includes("não existem")) {
            return reply.status(400).send({
                message: error.message,
            });
        }

        return reply.status(500).send({
            message: "Erro interno do servidor.",
        });
    });
}