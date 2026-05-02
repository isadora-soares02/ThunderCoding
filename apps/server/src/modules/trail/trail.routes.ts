import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../plugins/auth.js";
import {
    createTrailSchema,
    trailQuerySchema,
    updateTrailSchema,
} from "../../schemas/trail.schema.js";
import { toCourseStatus, toDifficulty } from "../../utils/enums.js";
import { trailToResponse } from "./trail.mapper.js";

export function trailRoutes(app: FastifyInstance) {
    app.get("/trails", async (request) => {
        const query = trailQuerySchema.parse(request.query);

        const trails = await prisma.trail.findMany({
            where: {
                status: query.status ? toCourseStatus(query.status) : "PUBLISHED",
                level: query.level ? toDifficulty(query.level) : undefined,
                OR: query.search
                    ? [
                        {
                            name: {
                                contains: query.search,
                                mode: "insensitive",
                            },
                        },
                        {
                            description: {
                                contains: query.search,
                                mode: "insensitive",
                            },
                        },
                    ]
                    : undefined,
            },
            include: {
                courses: {
                    include: {
                        course: {
                            include: {
                                _count: {
                                    select: {
                                        lessons: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        order: "asc",
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            trails: trails.map(trailToResponse),
        };
    });

    app.get("/api/trails/:id", async (request, reply) => {
        const params = idParamSchema.parse(request.params);

        const trail = await prisma.trail.findUnique({
            where: {
                id: params.id,
            },
            include: {
                courses: {
                    include: {
                        course: {
                            include: {
                                lessons: {
                                    orderBy: {
                                        order: "asc",
                                    },
                                },
                                _count: {
                                    select: {
                                        lessons: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        order: "asc",
                    },
                },
            },
        });

        if (!trail) {
            return reply.status(404).send({
                message: "Trilha não encontrada.",
            });
        }

        return {
            trail: trailToResponse(trail),
        };
    });

    app.post(
        "/api/admin/trails",
        {
            preHandler: requireAdmin,
        },
        async (request, reply) => {
            const body = createTrailSchema.parse(request.body);

            await validateCoursesExist(body.courseIds);

            const trail = await prisma.trail.create({
                data: {
                    name: body.name,
                    description: body.description,
                    level: toDifficulty(body.level),
                    totalXp: body.totalXp,
                    progress: body.progress,
                    status: toCourseStatus(body.status),
                    color: body.color || null,
                    icon: body.icon || null,
                    courses: {
                        create: body.courseIds.map((courseId, index) => ({
                            courseId,
                            ordem: index + 1,
                        })),
                    },
                },
                include: trailInclude,
            });

            return reply.status(201).send({
                message: "Trilha criada com sucesso.",
                // @ts-expect-error
                trail: trailToResponse(trail),
            });
        }
    );

    app.patch(
        "/api/admin/trails/:id",
        {
            preHandler: requireAdmin,
        },
        async (request) => {
            const params = idParamSchema.parse(request.params);
            const body = updateTrailSchema.parse(request.body);

            if (body.courseIds) {
                await validateCoursesExist(body.courseIds);
            }

            const trail = await prisma.$transaction(async (tx) => {
                const updatedTrail = await tx.trail.update({
                    where: {
                        id: params.id,
                    },
                    data: {
                        name: body.name,
                        description: body.description,
                        level: body.level ? toDifficulty(body.level) : undefined,
                        totalXp: body.totalXp,
                        progress: body.progress,
                        status: body.status ? toCourseStatus(body.status) : undefined,
                        color: body.color,
                        icon: body.icon,
                    },
                });

                if (body.courseIds) {
                    await tx.trailCourse.deleteMany({
                        where: {
                            trailId: params.id,
                        },
                    });

                    await tx.trailCourse.createMany({
                        data: body.courseIds.map((courseId, index) => ({
                            trailId: params.id,
                            courseId,
                            ordem: index + 1,
                        })),
                    });
                }

                return tx.trail.findUniqueOrThrow({
                    where: {
                        id: updatedTrail.id,
                    },
                    include: trailInclude,
                });
            });

            return {
                message: "Trilha atualizada com sucesso.",
                // @ts-expect-error
                trail: trailToResponse(trail),
            };
        }
    );

    app.delete(
        "/api/admin/trails/:id",
        {
            preHandler: requireAdmin,
        },
        async (request) => {
            const params = idParamSchema.parse(request.params);

            await prisma.trail.delete({
                where: {
                    id: params.id,
                },
            });

            return {
                message: "Trilha removida com sucesso.",
            };
        }
    );
}

const idParamSchema = z.object({
    id: z.string().min(1),
});

const trailInclude: Prisma.TrailInclude = {
    courses: {
        include: {
            course: {
                include: {
                    _count: {
                        select: {
                            lessons: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            order: "asc" as const,
        },
    },
};

async function validateCoursesExist(coursesIds: string[]) {
    if (coursesIds.length === 0) {
        return;
    }

    const uniqueIds = [...new Set(coursesIds)];

    const total = await prisma.course.count({
        where: {
            id: {
                in: uniqueIds,
            },
        },
    });

    if (total !== uniqueIds.length) {
        throw new Error("Um ou mais cursos informados não existem.");
    }
}
