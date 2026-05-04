import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LessonViewPage } from "@/components/pages/aulas";
import type { LessonResponse } from "@/hooks/use-lesson";
import { apiFetch } from "@/lib/api-fetch";

interface Props {
    params: Promise<{ id: string }>;
}

async function getLesson(id: string) {
    const cookieStore = await cookies();

    return apiFetch<LessonResponse>(`/api/lessons/${id}`, {
        headers: {
            Cookie: cookieStore.toString(),
        },
    });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    const data = await getLesson(id);
    const lesson = data?.lesson;

    if (!lesson) {
        return {
            title: "Aula Não Encontrada",
        };
    }

    return {
        title: lesson.title,
    };
}

export default async function LessonView({ params }: Props) {
    const { id } = await params;

    return <LessonViewPage id={id} />;
}
