import "fastify";
import type { UserRole } from "../generated/prisma/enums";

declare module "fastify" {
    interface FastifyRequest {
        user?: {
            id: string;
            name: string;
            email: string;
            role?: UserRole;
        };
    }
}
