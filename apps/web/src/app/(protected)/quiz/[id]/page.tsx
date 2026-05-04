import type { Metadata } from "next";
import { QuizViewPage } from "@/components/pages/quiz";
import type { QuestionResponse } from "@/hooks/use-quiz";
import { apiFetch } from "@/lib/api-fetch";

interface Props {
    params: Promise<{ id: string }>;
}

function getQuestion(id: string) {
    return apiFetch<QuestionResponse>(`/api/questions/${id}`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    const data = await getQuestion(id);
    const question = data?.question;

    if (!question) {
        return {
            title: "Trilha Não Encontrada",
        };
    }

    return {
        title: question.question,
    };
}

export default async function QuizView({ params }: Props) {
    const { id } = await params;

    return <QuizViewPage id={id} />;
}
