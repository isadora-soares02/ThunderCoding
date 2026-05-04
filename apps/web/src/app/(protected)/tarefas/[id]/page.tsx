import type { Metadata } from "next";
import { TaskViewPage } from "@/components/pages/tarefas";
import type { TaskResponse } from "@/hooks/use-task";
import { apiFetch } from "@/lib/api-fetch";

interface Props {
    params: Promise<{ id: string }>;
}

function getTask(id: string) {
    return apiFetch<TaskResponse>(`/api/tasks/${id}`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    const data = await getTask(id);
    const task = data?.task;

    if (!task) {
        return {
            title: "Tarefa Não Encontrada",
        };
    }

    return {
        title: task.title,
        description: task.description,
    };
}

export default async function TaskView({ params }: Props) {
    const { id } = await params;

    return <TaskViewPage id={id} />;
}
