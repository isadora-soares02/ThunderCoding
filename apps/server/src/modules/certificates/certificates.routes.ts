import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../plugins/auth.js";
import { generateCertificatePDF } from "./certificate-pdf.service.js";

export function certificateRoutes(app: FastifyInstance) {
    app.get(
        "/certificates/course/:courseId",
        { preHandler: requireAuth },
        async (request, reply) => {
            const { courseId } = z
                .object({
                    courseId: z.string(),
                })
                .parse(request.params);

            const userId = request.user!.id;

            const progress = await prisma.userCourseProgress.findUnique({
                where: {
                    userId_courseId: {
                        userId,
                        courseId,
                    },
                },
            });

            if (!progress?.completed) {
                return reply.status(403).send({
                    message: "Certificado disponível apenas após concluir o curso.",
                });
            }

            const user = await prisma.user.findUniqueOrThrow({
                where: {
                    id: userId,
                },
            });

            const course = await prisma.course.findUniqueOrThrow({
                where: {
                    id: courseId,
                },
                include: {
                    lessons: {
                        orderBy: {
                            order: "asc",
                        },
                        select: {
                            title: true,
                            content: true,
                            type: true,
                            xp: true,
                            durationMin: true,
                        },
                    },
                },
            });

            const certificate = await prisma.certificate.upsert({
                where: {
                    userId_courseId_type: {
                        userId,
                        courseId,
                        type: "COURSE",
                    },
                },
                update: {},
                create: {
                    userId,
                    courseId,
                    type: "COURSE",
                    code: `TC-C-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
                },
            });

            const pdf = await generateCertificatePDF({
                studentName: user.name,
                title: course.title,
                type: "Curso",
                code: certificate.code,
                issuedAt: certificate.issuedAt,
                lessons: course.lessons,
            });

            const safeTitle = slugify(course.title);

            reply
                .header("Content-Type", "application/pdf")
                .header(
                    "Content-Disposition",
                    `attachment; filename="certificado-${safeTitle}.pdf"`
                );

            return reply.send(pdf);
        }
    );
}

function slugify(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
}