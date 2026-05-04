import type { Metadata } from "next";
import { AchievementsPage } from "@/components/pages/conquistas";

export const metadata: Metadata = {
    title: "Conquistas",
    description: "Conquistas da plataforma",
};

export default function Achievements() {
    return <AchievementsPage />;
}
