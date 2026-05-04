import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://thundercoding.apptivium.com.br"),

  title: {
    default: "ThunderCoding",
    template: "%s | ThunderCoding",
  },

  description:
    "ThunderCoding é uma plataforma para aprender programação, desenvolver projetos e evoluir como desenvolvedor.",

  keywords: [
    "ThunderCoding",
    "programação",
    "desenvolvimento web",
    "cursos de programação",
    "Next.js",
    "React",
    "TypeScript",
  ],

  authors: [{ name: "ThunderCoding" }],
  creator: "ThunderCoding",
  publisher: "ThunderCoding",

  openGraph: {
    title: "ThunderCoding",
    description:
      "Aprenda programação, crie projetos reais e evolua como desenvolvedor com a ThunderCoding.",
    url: "https://thundercoding.apptivium.com.br",
    siteName: "ThunderCoding",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ThunderCoding",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "ThunderCoding",
    description:
      "Aprenda programação, crie projetos reais e evolua como desenvolvedor com a ThunderCoding.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: "https://thundercoding.apptivium.com.br",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={cn("font-sans", inter.variable)} lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
