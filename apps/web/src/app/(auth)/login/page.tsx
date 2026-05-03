"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, useSession } from "@/lib/auth-client";
import { type LoginInput, loginSchema } from "@/schemas";

export default function LoginPage() {
    const router = useRouter();
    const { data: session } = useSession();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    if (session?.user) {
        return router.replace("/dashboard");
    }

    const onSubmit = async (data: LoginInput) => {
        try {
            await authClient.signIn.email({
                email: data.email,
                password: data.password,
            });

            toast.success("Bem-vindo de volta!");
            router.replace("/dashboard");
        } catch {
            toast.error("Não foi possível entrar.");
        }
    };

    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="hidden flex-col justify-between bg-gradient-hero p-10 text-primary-foreground lg:flex">
                <Logo />
                <div className="max-w-md space-y-3">
                    <h2 className="font-display text-4xl leading-tight">
                        Continue de onde parou.
                    </h2>
                    <p className="opacity-90">
                        Sua sequência te espera. Vamos manter a chama acesa? 🔥
                    </p>
                </div>
                <p className="text-sm opacity-75">
                    © {new Date().getFullYear()} ThunderCoding
                </p>
            </div>

            <div className="flex flex-col justify-center px-5 py-10 sm:px-10">
                <div className="mb-8 lg:hidden">
                    <Logo />
                </div>
                <div className="mx-auto w-full max-w-sm">
                    <h1 className="font-display text-3xl">Entrar</h1>
                    <p className="mt-1 text-muted-foreground">
                        Acesse sua conta e continue aprendendo.
                    </p>

                    <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-1.5">
                            <Label htmlFor="email">E-mail</Label>

                            <Input
                                id="email"
                                placeholder="voce@exemplo.com"
                                type="email"
                                {...register("email")}
                            />

                            {errors.email && (
                                <p className="text-destructive text-xs">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                placeholder="••••••••"
                                type="password"
                                {...register("password")}
                            />

                            {errors.password && (
                                <p className="text-destructive text-xs">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <Button
                            className="w-full shadow-glow"
                            disabled={isSubmitting}
                            size="lg"
                            type="submit"
                        >
                            {isSubmitting ? "Entrando..." : "Entrar"}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-muted-foreground text-sm">
                        Ainda não tem conta?{" "}
                        <Link
                            className="font-semibold text-primary hover:underline"
                            href="/cadastro"
                        >
                            Cadastre-se
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
