import { z } from "zod"

/**
 * Este arquivo centraliza a leitura das variáveis de ambiente.
 * A ideia é:
 * - validar cedo
 * - falhar cedo
 * - evitar process.env espalhado no projeto inteiro
 */
const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(3333),
    CLIENT_ORIGIN: z.url(),
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url()
})

export const env = envSchema.parse(process.env)