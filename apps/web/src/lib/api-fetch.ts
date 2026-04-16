import { z } from "zod"

/**
 * URL base da API.
 * 
 * Tudo vai sair daqui:
 * /api/health
 * /api/examples
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * Validação simples para garantir que a env existe.
 * Se faltar, o erro aparece cedo e de forma clara.
 */
const envSchema = z.url()
envSchema.parse(API_URL)

/**
 * Tipagem base para opções do fetch.
 */
type ApiFetchOptions = RequestInit & {
    /**
     * Quando true, tentamos parsear a resposta como texto.
     * Útil para casos específicos. O padrão será JSON.
     */
    parseAsText?: boolean
}

/**
 * Função central para chamadas HTTP do frontend.
 * 
 * Por que isso é importante?
 * - evita repetir URL base em todo lugar
 * - centraliza headers
 * - centraliza tratamento de erro
 * - facilita crescer
 * 
 * Regra:
 * - ao invés de usar fetch(...) espalhado pelo projeto,
 *   preferir usar apiFetch(...)
 */
export async function apiFetch<T>(
    path: string,
    options: ApiFetchOptions = {}
): Promise<T> {
    const { parseAsText = false, headers, ...rest } = options

    const response = await fetch(`${API_URL}${path}`, {
        ...rest,
        headers: {
            "Content-Type": "application/json",
            ...headers
        },

        /**
         * Muito importante para auth baseada em cookie/sessão:
         * garante envio de cookies para a API.
         */
        credentials: "include"
    })

    if (!response.ok) {
        let errorBody: unknown = null

        try {
            errorBody = await response.json()
        } catch {
            errorBody = await response.text().catch(() => null)
        }

        throw new Error(
            `Requisição para API falhou: ${response.status} ${response.statusText} - ${JSON.stringify(errorBody)}`
        )
    }

    if (parseAsText) {
        return (await response.text()) as T
    }

    return response.json() as Promise<T>
}