import type { Metadata } from "next";
import { ProfilePage } from "@/components/pages/perfil";

export const metadata: Metadata = {
    title: "Perfil",
    description: "Perfil do usuário",
};

export default function Profile() {
    return <ProfilePage />;
}
