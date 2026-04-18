import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        // Usar a função env() do próprio Prisma evita o erro de 'process'
        url: env("DATABASE_URL"), 
    },
});