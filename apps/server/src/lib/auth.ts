import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "./env";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),

    secret: env.BETTER_AUTH_SECRET,

    trustedOrigins: ["*"],

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: true
    },

    emailVerification: {
        sendOnSignIn: true,
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
            // teste
        }
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "USER",
                input: false
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
                input: false
            }
        }
    },

    experimental: {
        joins: true
    }
})