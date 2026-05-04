import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { getSession, requireAdmin, requireAuth } from "../../plugins/auth";
import {
    courseQuerySchema,
    createCourseSchema,
    updateCourseSchema,
} from "../../schemas/course.schema";
import { toCourseStatus, toDifficulty } from "../../utils/enums";
import { courseToResponse } from "./course.mapper";

export function courseRoutes(app: FastifyInstance) {
    app.get("/courses",
        {
            preHandler: requireAuth,
        },
        async (request) => {
            const query = courseQuerySchema.parse(request.query);

            const session = await getSession(request);
            const userId = session?.user?.id;

            const courses = await prisma.course.findMany({
                where: {
                    status: query.status ? toCourseStatus(query.status) : "PUBLISHED",
                    language: query.language
                        ? {
                            contains: query.language,
                            mode: "insensitive",
                        }
                        : undefined,
                    level: query.level ? toDifficulty(query.level) : undefined,
                    OR: query.search
                        ? [
                            {
                                title: {
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
                            {
                                language: {
                                    contains: query.search,
                                    mode: "insensitive",
                                },
                            },
                        ]
                        : undefined,
                },
                include: {
                    _count: {
                        select: {
                            lessons: true,
                        },
                    },
                    progress: userId
                        ? {
                            where: {
                                userId,
                            },
                        }
                        : false,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            return {
                courses: courses.map(courseToResponse),
            };
        });

    app.get("/courses/:id",
        {
            preHandler: requireAuth,
        },
        async (request, reply) => {
            const params = zIdParam(request.params);
            const session = await getSession(request);
            const userId = session?.user?.id;

            const course = await prisma.course.findUnique({
                where: {
                    id: params.id,
                },
                include: {
                    lessons: {
                        orderBy: {
                            order: "asc",
                        },
                        include: {
                            progress: {
                                where: {
                                    userId,
                                },
                            },
                        },
                    },
                    questions: true,
                    tasks: true,
                    _count: {
                        select: {
                            lessons: true,
                        },
                    },
                    progress: userId
                        ? {
                            where: {
                                userId,
                            },
                        }
                        : false,
                },
            });

            if (!course) {
                return reply.status(404).send({
                    message: "Curso não encontrado.",
                });
            }

            return {
                course: courseToResponse(course),
                lessons: course.lessons.map((lesson) => lessonToResponse(lesson)),
                totalQuestions: course.questions.length,
                totalTasks: course.tasks.length,
            };
        });

    app.post(
        "/admin/courses",
        {
            preHandler: requireAdmin,
        },
        async (request, reply) => {
            const body = createCourseSchema.parse(request.body);

            const course = await prisma.course.create({
                data: {
                    title: body.title,
                    description: body.description,
                    language: body.language,
                    level: toDifficulty(body.level),
                    duration: body.duration,
                    xp: body.xp,
                    instructor: body.instructor,
                    banner: body.banner || null,
                    color: body.color || null,
                    status: toCourseStatus(body.status),
                },
                include: {
                    _count: {
                        select: {
                            lessons: true,
                        },
                    },
                },
            });

            return reply.status(201).send({
                message: "Curso criado com sucesso.",
                course: courseToResponse(course),
            });
        }
    );

    app.patch(
        "/admin/courses/:id",
        {
            preHandler: requireAdmin,
        },
        async (request) => {
            const params = zIdParam(request.params);
            const body = updateCourseSchema.parse(request.body);

            const course = await prisma.course.update({
                where: {
                    id: params.id,
                },
                data: {
                    title: body.title,
                    description: body.description,
                    language: body.language,
                    level: body.level ? toDifficulty(body.level) : undefined,
                    duration: body.duration,
                    xp: body.xp,
                    instructor: body.instructor,
                    banner: body.banner,
                    color: body.color,
                    status: body.status ? toCourseStatus(body.status) : undefined,
                },
                include: {
                    _count: {
                        select: {
                            lessons: true,
                        },
                    },
                },
            });

            return {
                message: "Curso atualizado com sucesso.",
                course: courseToResponse(course),
            };
        }
    );

    app.delete(
        "/admin/courses/:id",
        {
            preHandler: requireAdmin,
        },
        async (request) => {
            const params = zIdParam(request.params);

            await prisma.course.delete({
                where: {
                    id: params.id,
                },
            });

            return {
                message: "Curso removido com sucesso.",
            };
        }
    );
}

function zIdParam(params: unknown) {
    return z.object({ id: z.string().min(1) }).parse(params);
}

import { z } from "zod"; import { lessonToResponse } from "../lessons/lesson.mapper";

