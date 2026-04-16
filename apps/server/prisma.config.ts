import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma atual usa este arquivo para localizar schema e URL de conexão.
 * Isso deixa a configuração mais explícita para o time.
 */
export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        url: env("DATABASE_URL"),
    },
});