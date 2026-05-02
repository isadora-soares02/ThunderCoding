import { fromNodeHeaders } from "better-auth/node";
import Fastify from "fastify";
import {
    serializerCompiler,
    validatorCompiler,
} from "fastify-type-provider-zod";
import { auth } from "./lib/auth";
import { prisma } from "./lib/prisma";
import { achievementRoutes } from "./modules/achievement/achievement.routes";
import { adminRoutes } from "./modules/admin/admin.routes";
import { courseRoutes } from "./modules/courses/course.routes";
import { dashboardRoutes } from "./modules/dashboard/dashbord.routes";
import { lessonRoutes } from "./modules/lessons/lesson.routes";
import { profileRoutes } from "./modules/profile/profile.routes";
import { quizRoutes } from "./modules/quiz/quiz.routes";
import { taskRoutes } from "./modules/task/task.routes";
import { trailRoutes } from "./modules/trail/trail.routes";
import { registerAuthHandler } from "./plugins/auth-handler";
import { registerCors } from "./plugins/cors";
import { errorHandler } from "./plugins/error-handler";
import { swaggerPlugin } from "./plugins/swagger";
import { calculateLevel } from "./utils/xp";

export async function buildApp() {
    const app = Fastify({
        logger: true,
    });

    await registerCors(app);

    await app.register(errorHandler);
    await app.register(swaggerPlugin);

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    await app.register(
        async function apiRoutes(api) {
            await registerAuthHandler(api);

            // await api.register(healthRoutes, { prefix: "/health" });
            await api.register(trailRoutes);
            await api.register(taskRoutes);
            await api.register(quizRoutes);
            await api.register(profileRoutes);
            await api.register(lessonRoutes);
            await api.register(dashboardRoutes);
            await api.register(courseRoutes);
            await api.register(achievementRoutes);
            await api.register(adminRoutes);

            app.get("/me", async (request, reply) => {
                const session = await auth.api.getSession({
                    headers: fromNodeHeaders(request.headers),
                });

                if (!session?.user?.id) {
                    return reply.status(401).send({
                        message: "Você não está autenticado.",
                    });
                }

                const user = await prisma.user.findUniqueOrThrow({
                    where: { id: session.user.id },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        xp: true,
                        level: true,
                        streak: true,
                        completedCourses: true,
                        role: true,
                    },
                });

                const nivelData = calculateLevel(user.xp);

                return {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        avatarUrl: user.image,
                        xp: user.xp,
                        level: user.level,
                        streak: user.streak,
                        completedCourses: user.completedCourses,
                        isAdmin: user.role === "ADMIN",
                        currentXp: nivelData.currentXp,
                        xpPerLevel: nivelData.xpPerLevel,
                        levelProgressPercentage: nivelData.percentage,
                    },
                };
            });
        },
        { prefix: "/api" }
    );

    return app;
}
