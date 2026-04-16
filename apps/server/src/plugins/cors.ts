import cors from "@fastify/cors";
import { FastifyInstance } from "fastify";
import { env } from "../lib/env.js";

/**
 * CORS do projeto.
 * 
 * Regra importante para o projeto:
 * - em dev: liberar só o front local
 * - em produção: liberar apenas domínios reais e conhecidos
 * 
 * Nunca usar origin: true ou origin: "*"
 * junto com credentials em produção.
 */
export async function registerCors(app: FastifyInstance) {
    await app.register(cors, {
        origin: env.CLIENT_ORIGIN,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        maxAge: 86400
    })
}