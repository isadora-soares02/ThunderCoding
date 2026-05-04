import type { Metadata } from "next";
import { QuizViewPage } from "@/components/pages/quiz";

interface Props {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: "Quiz"
};

export default async function QuizView({ params }: Props) {
    const { id } = await params;

    return <QuizViewPage id={id} />;
}
