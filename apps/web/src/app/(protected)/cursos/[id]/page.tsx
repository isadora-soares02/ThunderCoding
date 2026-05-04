import type { Metadata } from "next";
import { CourseDetail } from "@/components/pages/cursos/course-detail";
import type { CourseDetailResponse } from "@/hooks/use-course-details";
import { apiFetch } from "@/lib/api-fetch";

interface Props {
    params: Promise<{ id: string }>;
}

function getCourse(id: string) {
    return apiFetch<CourseDetailResponse>(`/api/courses/${id}`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    const data = await getCourse(id);
    const course = data?.course;

    if (!course) {
        return {
            title: "Curso Não Encontrado",
        };
    }

    return {
        title: course.title,
        description: course.description,
    };
}

export default async function Page({ params }: Props) {
    const { id } = await params;

    return <CourseDetail id={id} />;
}
