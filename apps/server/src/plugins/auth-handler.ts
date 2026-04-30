import type { FastifyInstance } from "fastify";
import { auth } from "../lib/auth";

export function registerAuthHandler(app: FastifyInstance) {
    app.route({
        method: ["GET", "POST"],
        url: "/auth/*",
        async handler(request, reply) {
            try {
                const url = new URL(request.url, `http://${request.headers.host}`);

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

                const req = new Request(url.toString(), {
                    method: request.method,
                    headers,
                    body:
                        request.body && request.method !== "GET"
                            ? JSON.stringify(request.body)
                            : undefined,
                });

                const response = await auth.handler(req);

                reply.status(response.status);

                response.headers.forEach((value, key) => {
                    reply.header(key, value);
                });

                const text = await response.text();
                reply.send(text || null);
            } catch (err) {
                request.log.error(err);
                reply.status(500).send({
                    error: "Erro interno na autenticação",
                    code: "AUTH_FAILURE",
                });
            }
        },
    });
}
