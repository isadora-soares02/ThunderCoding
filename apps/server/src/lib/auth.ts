import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { sendVerificationEmail } from "./email";
import { env } from "./env";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    secret: env.BETTER_AUTH_SECRET,

    baseURL: "https://api.thundercoding.apptivium.com.br",

    trustedOrigins: [
        "https://thundercoding.apptivium.com.br",
        "https://api.thundercoding.apptivium.com.br",
    ],

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: true,
    },

    emailVerification: {
        sendOnSignIn: true,
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
            const verifyUrl = new URL(url);

            verifyUrl.searchParams.set(
                "callbackURL",
                `${env.FRONTEND_URL}/verify-email`
            );

            await sendVerificationEmail(user.email, verifyUrl.toString(), user.name);
        }
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "USER",
                input: false,
            },
            xp: {
                type: "number",
                required: false,
                defaultValue: 0,
                input: false,
            },
            level: {
                type: "number",
                required: false,
                defaultValue: 1,
                input: false,
            },
            streak: {
                type: "number",
                required: false,
                defaultValue: 0,
                input: false,
            },
            completedCourses: {
                type: "number",
                required: false,
                defaultValue: 0,
                input: false,
            },
        },
    },

    experimental: {
        joins: true,
    },
});
