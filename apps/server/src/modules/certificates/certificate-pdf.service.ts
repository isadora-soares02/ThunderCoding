import path from "node:path";
import PDFDocument from "pdfkit";

interface CertificateLessonInput {
    content?: string | null;
    durationMin?: number;
    title: string;
    type?: string;
    xp?: number;
}

interface CertificatePDFInput {
    code: string;
    issuedAt: Date;
    lessons?: CertificateLessonInput[];
    studentName: string;
    title: string;
    type: "Curso" | "Trilha";
}

export function generateCertificatePDF(input: CertificatePDFInput) {
    const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 0,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    return new Promise<Buffer>((resolve) => {
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        const pageW = doc.page.width;
        const pageH = doc.page.height;
        const bgPath = path.resolve(process.cwd(), "src/public/modelo-certificado.png");

        const studentName = abbreviateName(input.studentName);
        const issuedAt = formatDateLong(input.issuedAt);
        const typeText = input.type === "Curso" ? "o curso" : "a trilha";

        drawBackground(doc, bgPath, pageW, pageH);

        doc
            .font("Helvetica-Bold")
            .fontSize(28)
            .fillColor("#111827")
            .text("Certificado de Conclusão", 0, 170, {
                width: pageW,
                align: "center",
            });

        doc
            .font("Helvetica")
            .fontSize(14)
            .fillColor("#4b5563")
            .text("Certificamos que", 0, 210, {
                width: pageW,
                align: "center",
            });

        doc
            .font("Helvetica-Bold")
            .fontSize(studentName.length > 28 ? 30 : 34)
            .fillColor("#6d28d9")
            .text(studentName, 90, 240, {
                width: pageW - 180,
                align: "center",
            });

        doc
            .font("Helvetica")
            .fontSize(14)
            .fillColor("#4b5563")
            .text(`concluiu com sucesso ${typeText}`, 0, 290, {
                width: pageW,
                align: "center",
            });

        doc
            .font("Helvetica-Bold")
            .fontSize(input.title.length > 45 ? 20 : 23)
            .fillColor("#111827")
            .text(input.title, 115, 315, {
                width: pageW - 230,
                align: "center",
            });

        doc
            .moveTo(270, 385)
            .lineTo(pageW - 270, 385)
            .lineWidth(1.5)
            .strokeColor("#8b5cf6")
            .stroke();

        doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .fillColor("#7c3aed")
            .text("Emitido em", 165, 430, {
                width: 220,
                align: "center",
            });

        doc
            .font("Helvetica")
            .fontSize(12)
            .fillColor("#111827")
            .text(issuedAt, 165, 450, {
                width: 220,
                align: "center",
            });

        doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .fillColor("#7c3aed")
            .text("Código de validação", pageW - 405, 430, {
                width: 260,
                align: "center",
            });

        doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor("#111827")
            .text(input.code, pageW - 405, 450, {
                width: 260,
                align: "center",
            });

        doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor("#6b7280")
            .text(
                "Este certificado foi gerado automaticamente pela plataforma ThunderCoding.",
                0,
                pageH - 85,
                {
                    width: pageW,
                    align: "center",
                }
            );

        if (input.lessons?.length) {
            drawLessonsPages(doc, {
                bgPath,
                pageW,
                pageH,
                title: input.title,
                lessons: input.lessons,
            });
        }

        doc.end();
    });
}

function drawLessonsPages(
    doc: PDFKit.PDFDocument,
    input: {
        bgPath: string;
        pageW: number;
        pageH: number;
        title: string;
        lessons: CertificateLessonInput[];
    }
) {
    const { bgPath, pageW, pageH, title, lessons } = input;

    const startY = 230;
    const bottomY = pageH - 100;
    const rowH = 34;

    const leftX = 120;
    const rightX = pageW / 2 + 20;
    const colW = pageW / 2 - 150;

    const rowsPerColumn = Math.floor((bottomY - startY) / rowH);
    const itemsPerPage = rowsPerColumn * 2;

    lessons.forEach((lesson, index) => {
        const indexOnPage = index % itemsPerPage;
        const columnIndex = Math.floor(indexOnPage / rowsPerColumn);
        const rowIndex = indexOnPage % rowsPerColumn;

        if (indexOnPage === 0) {
            doc.addPage({
                size: "A4",
                layout: "landscape",
                margin: 0,
            });

            drawBackground(doc, bgPath, pageW, pageH);
            drawLessonsHeader(doc, pageW, title);
        }

        const x = columnIndex === 0 ? leftX : rightX;
        const y = startY + rowIndex * rowH;

        const meta = [
            lesson.type ? lessonTypeLabel(lesson.type) : null,
            lesson.durationMin ? `${lesson.durationMin} min` : null,
            lesson.xp ? `${lesson.xp} XP` : null,
        ]
            .filter(Boolean)
            .join(" • ");

        doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor("#6d28d9")
            .text(`${index + 1}. ${lesson.title}`, x, y, {
                width: colW,
                height: 13,
                ellipsis: true,
            });

        doc
            .font("Helvetica")
            .fontSize(7.5)
            .fillColor("#4b5563")
            .text(meta, x, y + 13, {
                width: colW,
                height: 10,
                ellipsis: true,
            });
    });
}

function drawLessonsHeader(doc: PDFKit.PDFDocument, pageW: number, title: string) {
    doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .fillColor("#111827")
        .text("Conteúdo do Curso", 0, 165, {
            width: pageW,
            align: "center",
        });

    doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#4b5563")
        .text(title, 120, 190, {
            width: pageW - 240,
            align: "center",
            ellipsis: true,
        });
}

function drawBackground(
    doc: PDFKit.PDFDocument,
    bgPath: string,
    pageW: number,
    pageH: number
) {
    doc.image(bgPath, 0, 0, {
        width: pageW,
        height: pageH,
    });
}

function abbreviateName(name: string) {
    const keepLowercase = new Set(["de", "da", "do", "das", "dos", "e"]);
    const parts = name.trim().replace(/\s+/g, " ").split(" ");

    if (parts.length <= 3) {
        return name.trim();
    }

    const first = parts[0];
    const last = parts.at(-1);

    const middle = parts.slice(1, -1).map((part) => {
        const normalized = part.toLowerCase();

        if (keepLowercase.has(normalized)) {
            return normalized;
        }

        return `${part[0].toUpperCase()}.`;
    });

    return [first, ...middle, last].join(" ");
}

function formatDateLong(date: Date) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

function lessonTypeLabel(type: string) {
    const labels: Record<string, string> = {
        TEXT: "Texto",
        VIDEO: "Vídeo",
        ASSIGNMENT: "Atividade",
        QUIZ: "Quiz",
    };

    return labels[type] ?? type;
}
