import type { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";

export async function swaggerPlugin(app: FastifyInstance) {
    const theme = new SwaggerTheme();
    const content = theme.getBuffer(SwaggerThemeNameEnum.DARK);

    await app.register(fastifySwagger, {
        openapi: {
            info: {
                title: "ThunderCoding",
                description: "API ThunderCoding",
                version: "1.0.0",
            },
            servers: [
                {
                    url: "http://localhost:3333",
                    description: "Servidor local",
                },
            ],
            tags: [
                { name: "Health", description: "Status da API" },
                { name: "Auth", description: "Autenticação" },
                { name: "Dashboard", description: "Dashboard do aluno" },
                { name: "Courses", description: "Cursos" },
                { name: "Trails", description: "Trilhas" },
                { name: "Lessons", description: "Aulas" },
                { name: "Quiz", description: "Quizzes e perguntas" },
                { name: "Tasks", description: "Tarefas" },
                { name: "Achievements", description: "Conquistas" },
                { name: "Admin", description: "Painel administrativo" },
            ],
            components: {
                securitySchemes: {
                    cookieAuth: {
                        type: "apiKey",
                        in: "cookie",
                        name: "better-auth.session_token",
                    },
                },
            },
        },
    });

    await app.register(fastifySwaggerUi, {
        routePrefix: "/docs",
        theme: {
            css: [{ filename: "theme.css", content }],
        },
    });
}