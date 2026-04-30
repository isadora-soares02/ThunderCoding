import { z } from "zod"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const envSchema = z.url()
envSchema.parse(API_URL)

type ApiFetchOptions = RequestInit & {
    parseAsText?: boolean
}

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