import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { env } from "./env.js";

/**
 * Aqui nasce a configuração principal da autenticação.
 * 
 * O que estamos ativando:
 * - conexão com o banco via Prisma
 * - login/cadastro com email e senha
 * - requireEmailVerification = false no começo para simplificar o projeto
 * - trustedOrigins para liberar o front
 * 
 * Posteriormente, será ligado:
 * - requireEmailVerification: true,
 * - sendResetPassword
 * - sendVerificationEmail
 */
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),

    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,

    trustedOrigins: [env.CLIENT_ORIGIN],

    emailAndPassword: {
        enabled: true,

        /**
         * Para o começo do projeto, deixamos false
         * para não travar com fluxo de email.
         * Em produção, o ideal é ativar verificação.
         */
        requireEmailVerification: false,

        /**
         * Regras explícitas para senha
         */
        minPasswordLength: 8,
        maxPasswordLength: 128,

        /**
         * Após cadastro, o usuário pode entrar automaticamente.
         */
        autoSignIn: true
    },

    /**
     * A documentação do Better Auth menciona suporte a joins experimentais
     * no adapter Prisma, trazendo ganhos em alguns endpoints.
     */
    experimental: {
        joins: true
    }
})