import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client.js"
import { env } from "./env.js"

/**
 * Instância única do Prisma.
 * 
 * Em desenvolvimento, usamos uma variável global para evitar
 * recriar o client a cada reload do tsx watch.
 */
const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient
}

const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL
})

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: ["warn", "error"],
        adapter
    })

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
}