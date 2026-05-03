"use client"

import { ArrowRight, Brain, Flame, Sparkles, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Brain,
    title: "Trilhas guiadas",
    desc: "Caminhos curados do iniciante ao avançado.",
  },
  {
    icon: Zap,
    title: "Ganhe XP a cada aula",
    desc: "Cada conquista te deixa mais forte.",
  },
  {
    icon: Flame,
    title: "Mantenha sua streak",
    desc: "Estude todo dia e veja sua chama crescer.",
  },
  {
    icon: Trophy,
    title: "Conquistas exclusivas",
    desc: "Desbloqueie medalhas únicas no caminho.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container flex items-center justify-between py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild className="shadow-glow">
            <Link href="/cadastro">Criar conta</Link>
          </Button>
        </div>
      </header>

      <section className="container relative grid gap-10 py-12 lg:grid-cols-2 lg:py-20">
        <div className="flex animate-fade-in flex-col justify-center gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary text-sm">
            <Sparkles size={14} /> Sua jornada de código começa agora
          </span>

          <h1 className="text-balance font-display text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
            Aprenda a programar com{" "}
            <span className="bg-gradient-primary bg-clip-text text-white">
              energia
            </span>
            .
          </h1>

          <p className="max-w-lg text-lg text-muted-foreground">
            Trilhas, cursos, quizzes e conquistas para transformar você em
            desenvolvedor — com a diversão de um jogo.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="shadow-glow" size="lg">
              <Link href="/cadastro">
                Começar grátis <ArrowRight size={18} />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-muted-foreground text-sm">
            <span>
              <strong className="text-foreground">+1.200</strong> alunos
            </span>

            <span>
              <strong className="text-foreground">6</strong> trilhas
            </span>

            <span>
              <strong className="text-foreground">144</strong> aulas
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-hero opacity-20 blur-2xl" />

          <div className="relative rounded-3xl border bg-card p-6 shadow-card">
            <div className="rounded-2xl bg-gradient-hero p-5 text-primary-foreground">
              <p className="text-sm opacity-90">Próxima aula</p>

              <h3 className="mt-1 font-display text-2xl">
                Funções tipadas em TS
              </h3>

              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-sm">
                  <Zap className="fill-current" size={14} /> +50 XP
                </span>

                <span className="text-sm">12 min</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {features.map((f) => (
                <div
                  className="rounded-2xl border bg-gradient-card p-4"
                  key={f.title}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <f.icon size={18} />
                  </div>

                  <h4 className="mt-3 font-semibold text-sm">{f.title}</h4>

                  <p className="text-muted-foreground text-xs">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="container py-8 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} ThunderCoding. Feito com energia para quem
        quer codar.
      </footer>
    </div>
  );
}
