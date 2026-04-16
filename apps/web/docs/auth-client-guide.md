# Auth Client Guide

## Objetivo

Este documento explica como o frontend usa o Better Auth.

O objetivo é deixar claro:

- onde a autenticação está configurada
- como ler sessão
- como fazer logout
- onde implementar login/cadastro depois

---

## Arquivo principal

```txt
src/lib/auth-client.ts
```

Esse arquivo centraliza o cliente do Better Auth no frontend.

---

## Responsabilidade do auth client

O `authClient` deve ser usado para:

- login
- cadastro
- logout
- leitura de sessão

Isso evita espalhar a lógica de autenticação pelo projeto.

---

## Por que usamos `baseURL`

Porque o frontend roda em uma URL e o backend em outra.

Exemplo:

- frontend: `http://localhost:3000`
- backend: `http://localhost:3333`

Então o Better Auth precisa saber onde estão as rotas:

- `/api/auth/sign-in/email`
- `/api/auth/sign-up/email`
- `/api/auth/sign-out`
- etc

---

## Onde usar `useSession`

Use `useSession()` em componentes client quando precisar saber:

- se o usuário está logado
- quem é o usuário atual
- se a sessão ainda está carregando

Exemplo:

```tsx
"use client";

import { useSession } from "@/lib/auth-client";

export function SessionInfo() {
  const { data, isPending } = useSession();

  if (isPending) return <p>Carregando...</p>;
  if (!data) return <p>Não Autenticado</p>;

  return <p>{data.user.email}</p>;
}
```

---

## Exemplo de logout

```tsx
"use client";

import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  return (
    <button onClick={() => authClient.signOut()}>
      Sair
    </button>
  );
}
```

---

## Onde deve implementar login depois

Quando for criar o login real, o ideal é criar algo como:

```txt
src/app/login/page.tsx
src/components/auth/login-form.tsx
```

O formulário pode usar o `authClient` para fazer o sign in.

---

## Fluxo recomendado para auth no frontend

### 1. Criar o formulário
Exemplo:
- email
- senha

### 2. Usar o `authClient`
A ação do formulário deve chamar o cliente de auth.

### 3. Tratar loading e erro
Sempre mostrar feedback para o usuário.

### 4. Redirecionar após login
Depois o time pode mandar o usuário para:
- dashboard
- profile

---

## O que evitar

- chamar manualmente endpoints de auth em vários lugares
- duplicar lógica de sessão
- criar vários clients de auth
- misturar login, cadastro e sessão em arquivos aleatórios

---

## Boas práticas

- manter tudo de auth centralizado
- usar `useSession` só em componentes client
- usar nomes claros
- tratar loading/erro
- criar componentes pequenos