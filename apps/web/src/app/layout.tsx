import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ThunderCoding",
  description: "Plataforma gamificada para aprender programação",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.className} h-full antialiased`}
    >
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
