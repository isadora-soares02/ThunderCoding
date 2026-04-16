import Fastify from "fastify";
import { registerCors } from "./plugins/cors.js";
import { registerAuthHandler } from "./plugins/auth-handler.js";
import { healthRoutes } from "./modules/health/routes.js";
import { userRoutes } from "./modules/users/routes.js";
import { exampleRoutes } from "./modules/example/routes.js";

/**
 * app.ts:
 * aqui montamos a aplicação Fastify.
 * 
 * Separar app.ts de server.ts ajuda:
 * - em testes, podemos importar só a app
 * - o bootstrap fica organizado
 * - melhor entendimento onde cada parte entra
 */
export async function buildApp() {
    const app = Fastify({
        logger: true
    })

    // 1) CORS primeiro
    await registerCors(app)

    /**
     * Prefixo global da API.
     * 
     * Tudo que for rota do projeto vai seguir o padrão:
     * /api/...
     * 
     * Exemplos:
     * /api/health
     * /api/auth/sign-in/email
     */
    await app.register(async function apiRoutes(api) {
        // 2) Handler do Better Auth
        await registerAuthHandler(api)

        // 3) Rotas de domínio da aplicação
        await api.register(healthRoutes, { prefix: "/health" })
        await api.register(userRoutes, { prefix: "/users" })
        await api.register(exampleRoutes, { prefix: "/example" })
    }, { prefix: "/api" })

    return app
}