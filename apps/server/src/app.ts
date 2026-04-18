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

    // 1) CORS primeiro (essencial para o front-end conseguir falar com o Better Auth)
    await registerCors(app)

    // 2) Prefixo global da API
    await app.register(async function apiRoutes(api) {
        
        // Handler do Better Auth
        // Nota: Dentro de apiRoutes, esta rota será /api/auth/*
        await registerAuthHandler(api)

        // Rotas de domínio
        api.register(healthRoutes, { prefix: "/health" })
        api.register(userRoutes, { prefix: "/users" })
        api.register(exampleRoutes, { prefix: "/example" })
        
    }, { prefix: "/api" })

    return app
}