import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client"; // Importa do pacote padrão
import pg from "pg"; // Precisas do driver 'pg' para o adaptador
import { env } from "./env.js";

/**
 * Instância única do Prisma.
 * Usamos globalThis para evitar múltiplas instâncias em desenvolvimento (Hot Reload).
 */
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Configuração do Driver do PostgreSQL para o adaptador
const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: ["warn", "error"],
        adapter
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}