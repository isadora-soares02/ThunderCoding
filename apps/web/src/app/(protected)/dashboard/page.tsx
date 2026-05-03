import type { Metadata } from "next";
import { DashboardPage } from "@/components/pages/dashboard";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Resumo do seu progresso na plataforma",
};

export default function Dashboard() {
    return <DashboardPage />;
}
