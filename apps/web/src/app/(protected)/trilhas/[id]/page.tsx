import type { Metadata } from "next";
import { TrailDetail } from "@/components/pages/trilhas/trail-detail";
import type { TrailDetailResponse } from "@/hooks/use-trail-detail";
import { apiFetch } from "@/lib/api-fetch";

interface Props {
    params: Promise<{ id: string }>;
}

function getTrail(id: string) {
    return apiFetch<TrailDetailResponse>(`/api/trails/${id}`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    const data = await getTrail(id);
    const trail = data?.trail;

    if (!trail) {
        return {
            title: "Trilha Não Encontrada",
        };
    }

    return {
        title: trail.name,
        description: trail.description,
    };
}

export default async function TrailDetailsPage({ params }: Props) {
    const { id } = await params;

    return <TrailDetail id={id} />;
}
