import { FastifyInstance } from "fastify";
import { auth } from "../lib/auth.js";

export async function registerAuthHandler(app: FastifyInstance) {
    // Usamos 'all' para aceitar qualquer método (GET, POST, PATCH, DELETE, etc)
    app.all("/api/auth/*", async (request, reply) => {
        try {
            // Construção robusta da URL
            const url = new URL(request.url, `${request.protocol}://${request.headers.host}`);

            // Conversão de Headers do Fastify para Fetch API
            const headers = new Headers();
            for (const [key, value] of Object.entries(request.headers)) {
                if (!value) continue;
                if (Array.isArray(value)) {
                    value.forEach(v => headers.append(key, v));
                } else {
                    headers.append(key, String(value));
                }
            }

            // Criar a Request compatível com Better Auth
            const req = new Request(url.toString(), {
                method: request.method,
                headers,
                // Apenas envia o body se não for GET ou HEAD
                body: ["GET", "HEAD"].includes(request.method) 
                    ? undefined 
                    : JSON.stringify(request.body)
            });

            const response = await auth.handler(req);

            // Setar status code
            reply.status(response.status);

            // Repassar headers da resposta (importante para Cookies/Set-Cookie)
            response.headers.forEach((value, key) => {
                reply.header(key, value);
            });

            // Enviar o corpo da resposta
            const data = await response.text();
            return reply.send(data);
            
        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({
                error: "Erro interno na autenticação",
                code: "AUTH_FAILURE"
            });
        }
    });
}