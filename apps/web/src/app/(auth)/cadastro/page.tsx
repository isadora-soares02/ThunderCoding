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
import { authClient } from "@/lib/auth-client";
import { type RegisterInput, registerSchema } from "@/schemas";

export default function Register() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterInput) => {
        try {
            await authClient.signUp.email({
                name: data.name,
                email: data.email,
                password: data.password,
            });
            toast.success("Conta criada! Sua jornada começa agora 🚀");
            router.replace("/dashboard");
        } catch {
            toast.error("Não foi possível criar a conta.");
        }
    };

    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="hidden flex-col justify-between bg-gradient-hero p-10 text-primary-foreground lg:flex">
                <Logo />
                <div className="max-w-md space-y-3">
                    <h2 className="font-display text-4xl leading-tight">
                        Sua jornada de código começa agora.
                    </h2>
                    <p className="opacity-90">
                        Crie sua conta gratuita e ganhe seus primeiros 50 XP. ⚡
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
                    <h1 className="font-display text-3xl">Criar conta</h1>
                    <p className="mt-1 text-muted-foreground">Leva menos de 1 minuto.</p>

                    <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Nome</Label>

                            <Input id="name" placeholder="Seu nome" {...register("name")} />

                            {errors.name && (
                                <p className="text-destructive text-xs">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

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
                                placeholder="Mínimo 6 caracteres"
                                type="password"
                                {...register("password")}
                            />

                            {errors.password && (
                                <p className="text-destructive text-xs">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="confirmar">Confirmar Senha</Label>

                            <Input
                                id="confirmPassword"
                                placeholder="Repita a senha"
                                type="password"
                                {...register("confirmPassword")}
                            />

                            {errors.confirmPassword && (
                                <p className="text-destructive text-xs">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <Button
                            className="w-full shadow-glow"
                            disabled={isSubmitting}
                            size="lg"
                            type="submit"
                        >
                            {isSubmitting ? "Criando..." : "Criar conta"}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-muted-foreground text-sm">
                        Já tem conta?{" "}
                        <Link
                            className="font-semibold text-primary hover:underline"
                            href="/login"
                        >
                            Entrar
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
