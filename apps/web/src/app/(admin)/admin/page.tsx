import type { Metadata } from "next";
import { AdminDashboardPage } from "@/components/pages/admin";

export const metadata: Metadata = {
    title: "Administrativo",
};

export default function AdminDashboard() {
    return <AdminDashboardPage />;
}
