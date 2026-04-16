"use client"

import { createAuthClient } from "better-auth/react"

/**
 * Cliente do Better Auth para o frontend.
 * 
 * Como nosso backend Fastify expõe o Better Auth em:
 * http://localhost:3333/api/auth/*
 * 
 * aqui apontamos o baseURL para a URL completa do auth server.
 * 
 * Regra prática:
 * - tudo que for login, logout, cadastro e sessão no front
 *   deve usar este cliente
 * - não chamar /api/auth manualmente com fetch cru,
 *   a não ser que existe uma necessidade muito específica.
 */
export const authClient = createAuthClient({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/auth`
})

/**
 * Exportamos também o hook useSession já pronto,
 * porque ele será usado em vários componentes.
 */
export const { useSession } = authClient