import type { Metadata } from "next";
import { CoursesPage } from "@/components/pages/cursos";

export const metadata: Metadata = {
    title: "Cursos",
    description: "Trilhas disponíveis na plataforma",
};

export default function Courses() {
    return <CoursesPage />;
}
