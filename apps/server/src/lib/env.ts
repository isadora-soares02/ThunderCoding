import { config } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
    config({ path: ".env.test", override: true });
} else {
    config();
}

export const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    DATABASE_URL: z.url().min(1),
    PORT: z.coerce.number().default(3333),
    BETTER_AUTH_SECRET: z.string().min(1),
    GMAIL_USER: z.string().min(1),
    GMAIL_APP_PASSWORD: z.string().min(1),
    FRONTEND_URL: z.string().min(1).default("http://localhost:3000")
});

export const env = envSchema.parse(process.env);
