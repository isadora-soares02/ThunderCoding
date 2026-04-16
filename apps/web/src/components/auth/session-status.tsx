"use client"

import { z } from "zod"
import { authClient, useSession } from "@/lib/auth-client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

/**
 * Schemas Zod
 * 
 * Aqui definimos as regras de validação dos formulários.
 * Isso ajuda a garantir que os dados estejam corretos
 * antes de chamar o Better Auth.
 */
const loginSchema = z.object({
    email: z.email("Digite um e-mail válido"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres")
})

const registerSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    email: z.email("Digite um e-mail válido"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string().min(8, "A confirmação deve ter pelo menos 8 caracteres")
}).refine((data) => data.password === data.confirmPassword, {
    error: "As senhas não coincidem",
    path: ["confirmPassword"]
})

/**
 * Exemplo de componente client usando Better Auth.
 * 
 * Este componente mostra:
 * - como ler a sessão atual
 * - como fazer sign out
 * 
 * Pode usar como base para:
 * - header autenticado
 * - menu do usuário
 * - área de perfil
 */
export function SessionStatus() {
    const { data: session, isPending, error } = useSession()

    /**
     * Estado para controlar qual aba aparece:
     * - "login"
     * - "register"
     */
    const [mode, setMode] = useState<"login" | "register">("register")

    /**
     * Estado simples para feedback geral da UI:
     * - mensagem de sucesso
     * - mensagem de erro
     * 
     * Isso é útil para mostrar retorno do backend/auth.
     */
    const [authMessage, setAuthMessage] = useState<string | null>(null)
    const [authError, setAuthError] = useState<string | null>(null)

    /**
     * Form do Login
     */
    const loginForm = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    /**
     * Form do cadastro
     */
    const registerForm = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    })

    /**
     * Handler (função) de login
     */
    const onSubmitLogin = loginForm.handleSubmit(async (data) => {
        setAuthMessage(null)
        setAuthError(null)

        try {
            /**
             * Aqui chamamos o método de login do Better Auth
             */
            const result = await authClient.signIn.email({
                email: data.email,
                password: data.password
            })
            if (result.error) {
                setAuthError(result.error.message ?? "Erro ao fazer login")
                return
            }

            setAuthMessage("Login realizado com sucesso.")
            loginForm.reset()
        } catch (err) {
            setAuthError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível fazer login."
            )
        }
    })

    /**
     * Handler (função) de cadastro
     */
    const onSubmitRegister = registerForm.handleSubmit(async (data) => {
        setAuthMessage(null)
        setAuthError(null)

        try {
            /**
             * Cadastro com e-mail e senha.
             */
            const result = await authClient.signUp.email({
                name: data.name,
                email: data.email,
                password: data.password
            })
            if (result.error) {
                setAuthError(result.error.message ?? "Erro ao criar conta.")
                return
            }

            setAuthMessage("Conta criada com sucesso.")
            registerForm.reset()

            setMode("login")
        } catch (err) {
            setAuthError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível criar a conta."
            )
        }
    })

    /**
     * Handler (função) de sair
     */
    async function handleSignOut() {
        setAuthMessage(null)
        setAuthError(null)

        try {
            const result = await authClient.signOut()
            if (result.error) {
                setAuthError(result.error.message ?? "Erro ao sair.")
                return
            }

            setAuthMessage("Logout realizado com sucesso.")
        } catch (err) {
            setAuthError(
                err instanceof Error ? err.message : "Não foi possível sair."
            )
        }
    }

    if (isPending) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
                Carregando sessão...
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                Erro ao carregar sessão.
            </div>
        )
    }

    if (!session) {
        return (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold">
                        Área de autenticação
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                        Exemplo base com login e cadastro usando Better Auth,
                        Zod e React Hook Form.
                    </p>
                </div>

                {/* Botões para alternar entre login e cadastro */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setMode("login")
                            setAuthError(null)
                            setAuthMessage(null)
                        }}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === "login"
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700"
                            }`}
                    >
                        Login
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setMode("register")
                            setAuthError(null)
                            setAuthMessage(null)
                        }}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === "register"
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700"
                            }`}
                    >
                        Cadastro
                    </button>
                </div>

                {/* Feedback global */}
                {authMessage && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {authMessage}
                    </div>
                )}

                {authError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {authError}
                    </div>
                )}

                {/* FORMULÁRIO DE LOGIN */}
                {mode === "login" && (
                    <form
                        onSubmit={onSubmitLogin}
                        className="space-y-4"
                    >
                        <div>
                            <label
                                htmlFor="login-email"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                E-mail
                            </label>

                            <input
                                id="login-email"
                                type="email"
                                placeholder="voce@email.com"
                                {...loginForm.register("email")}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
                            />

                            {loginForm.formState.errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {loginForm.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="login-password"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                Senha
                            </label>

                            <input
                                id="login-password"
                                type="password"
                                placeholder="••••••••"
                                {...loginForm.register("password")}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
                            />

                            {loginForm.formState.errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {loginForm.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loginForm.formState.isSubmitting}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                        >
                            {loginForm.formState.isSubmitting
                                ? "Entrando..."
                                : "Entrar"}
                        </button>
                    </form>
                )}

                {/* FORMULÁRIO DE CADASTRO */}
                {mode === "register" && (
                    <form
                        onSubmit={onSubmitRegister}
                        className="space-y-4"
                    >
                        <div>
                            <label
                                htmlFor="register-name"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                Nome
                            </label>

                            <input
                                id="register-name"
                                type="text"
                                placeholder="Seu nome"
                                {...registerForm.register("name")}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
                            />

                            {registerForm.formState.errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {registerForm.formState.errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="register-email"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                E-mail
                            </label>

                            <input
                                id="register-email"
                                type="email"
                                placeholder="voce@email.com"
                                {...registerForm.register("email")}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
                            />

                            {registerForm.formState.errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {registerForm.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="register-password"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                Senha
                            </label>

                            <input
                                id="register-password"
                                type="password"
                                placeholder="••••••••"
                                {...registerForm.register("password")}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
                            />

                            {registerForm.formState.errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {registerForm.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="register-confirm-password"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                Confirmar senha
                            </label>

                            <input
                                id="register-confirm-password"
                                type="password"
                                placeholder="••••••••"
                                {...registerForm.register("confirmPassword")}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
                            />

                            {registerForm.formState.errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {
                                        registerForm.formState.errors
                                            .confirmPassword.message
                                    }
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={registerForm.formState.isSubmitting}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                        >
                            {registerForm.formState.isSubmitting
                                ? "Cadastrando..."
                                : "Criar conta"}
                        </button>
                    </form>
                )}
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Usuário autenticado</h2>

            <div className="mt-4 space-y-1 text-sm text-slate-700">
                <p>
                    <span className="font-medium">Nome:</span>{" "}
                    {session.user.name ?? "Sem nome"}
                </p>

                <p>
                    <span className="font-medium">E-mail:</span>{" "}
                    {session.user.email}
                </p>
            </div>

            <button
                onClick={handleSignOut}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
                Sair
            </button>
        </div>
    )
}