import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import {
    serializerCompiler,
    validatorCompiler,
} from "fastify-type-provider-zod";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";
import { healthRoutes } from "./modules/health/routes";
import { registerAuthHandler } from "./plugins/auth-handler";
import { registerCors } from "./plugins/cors.js";

export async function buildApp() {
    const app = Fastify({
        logger: true,
    });

    await registerCors(app);

    const theme = new SwaggerTheme();
    const content = theme.getBuffer(SwaggerThemeNameEnum.DARK);

    app.register(fastifySwagger, {
        swagger: {
            consumes: ["application/json"],
            produces: ["application/json"],
            info: {
                title: "ThunderCoding",
                description: "API ThunderCoding",
                version: "1.0.0",
            },
        },
    });

    app.register(fastifySwaggerUi, {
        routePrefix: "/docs",
        theme: {
            css: [{ filename: "theme.css", content }],
        },
    });

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    await app.register(
        async function apiRoutes(api) {
            await registerAuthHandler(api);

            await api.register(healthRoutes, { prefix: "/health" });
        },
        { prefix: "/api" }
    );

    return app;
}
