import Fastify from "fastify";
import cors from "@fastify/cors";
import { auth } from "./lib/auth.js";
import { env } from "./lib/env.js";

const server = Fastify({ logger: true });

// 1. Registro de Plugins (CORS)
await server.register(cors, {
    origin: [env.CLIENT_ORIGIN],
    credentials: true,
});

// 2. Rota de Autenticação (Better Auth)
server.all("/api/auth/*", async (request, reply) => {
    const protocol = request.protocol;
    const host = request.hostname;
    const url = `${protocol}://${host}${request.url}`;

    const res = await auth.handler(
        new Request(url, {
            method: request.method,
            headers: new Headers(request.headers as Record<string, string>),
            body: request.method !== "GET" && request.method !== "HEAD" 
                ? JSON.stringify(request.body) 
                : undefined,
        })
    );

    res.headers.forEach((value, key) => {
        reply.header(key, value);
    });

    reply.status(res.status);
    return reply.send(await res.text());
});

// 3. Função de Inicialização (O "Start")
const start = async () => {
    try {
        // Importante: Adicionar o host 0.0.0.0 para evitar problemas de rede
        await server.listen({ port: 3333, host: "0.0.0.0" });
        console.log("🚀 Servidor Fastify pronto em http://localhost:3333"); // FOGUETAOKKKKKKKK
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();