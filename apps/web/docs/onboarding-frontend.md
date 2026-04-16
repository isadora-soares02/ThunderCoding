# Onboarding Frontend

## Objetivo

Este documento ajuda alguém a entrar no projeto frontend
e começar a contribuir.

---

## Passo 1: instalar dependências

Dentro de `apps/web`:

```bash
npm install
```

---

## Passo 2: configurar ambiente

Crie `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Passo 3: rodar o projeto

```bash
npm run dev
```

O frontend deve abrir em:

```txt
http://localhost:3000
```

---

## Passo 4: entender a base

Olhe primeiro estes arquivos:

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/example/page.tsx`
- `src/lib/auth-client.ts`
- `src/lib/api-fetch.ts`
- `src/components/auth/session-status.tsx`

---

## O que cada um ensina

### `layout.tsx`
Mostra a estrutura principal da aplicação.

### `page.tsx`
Mostra a home base.

### `example/page.tsx`
Mostra como consumir a API.

### `auth-client.ts`
Mostra como a autenticação foi conectada.

### `api-fetch.ts`
Mostra como fazer requisições para o backend.

### `session-status.tsx`
Mostra como usar sessão no cliente e sistema de autenticação (login e registro).

---

## Como criar uma nova página

Exemplo: `/dashboard`

Crie:

```txt
src/app/dashboard/page.tsx
```

Exemplo:

```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
```

---

## Como consumir a API

Exemplo:

```tsx
import { apiFetch } from "@/lib/api-fetch";

export default async function ExamplesPage() {
  const data = await apiFetch("/api/examples");

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

---

## Como trabalhar com auth

Se precisar de sessão no navegador:

- usar componente client
- usar `useSession`
- usar `authClient`