import type { Metadata } from "next";
import { TrailsPage } from "@/components/pages/trilhas";

export const metadata: Metadata = {
    title: "Trilhas",
    description: "Trilhas disponíveis na plataforma",
};

export default function Trails() {
    return <TrailsPage />;
}
