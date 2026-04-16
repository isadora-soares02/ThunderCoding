import { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
    /**
     * Rota simples para verificar se a API está ativa.
     * Muito útil para testes rápidos, deploy e monitoramento.
     */
    app.get("/", async () => {
        return {
            ok: true,
            service: "thundercoding-server",
            timestamp: new Date().toISOString()
        }
    })
}