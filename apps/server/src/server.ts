import "dotenv/config";
import { buildApp } from "./app.js"
import { env } from "./lib/env.js"

/**
 * server.ts:
 * arquivo de entrada do servidor.
 */
const start = async () => {
    const app = await buildApp()

    try {
        await app.listen({
            host: "::",
            port: env.PORT
        })

        app.log.info(`Servidor HTTP rodando em http://localhost:${env.PORT}`)
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

start()