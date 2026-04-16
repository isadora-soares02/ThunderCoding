# Frontend Guide

## Objetivo

Este documento explica como o frontend do ThunderCoding foi organizado
e como deve trabalhar em cima dessa base.

A proposta é deixar o projeto:

- didático
- fácil de entender
- simples para começar
- preparado para crescer

---

## Stack escolhida

### Next.js
Usamos Next.js porque ele já resolve bem:

- roteamento
- estrutura de páginas
- renderização
- layouts
- integração com React
- organização moderna de projeto

### TypeScript
Usamos TypeScript para:

- reduzir erros
- documentar melhor os dados
- facilitar manutenção
- ajudar a entender o formato das respostas da API

### Tailwind CSS
Usamos Tailwind para acelerar a construção das telas.

### Better Auth Client
Usamos Better Auth Client para:

- login
- cadastro
- leitura de sessão
- logout

### apiFetch
Criamos um `apiFetch` para centralizar as chamadas HTTP.

---

## Estrutura do projeto

```txt
src/
├─ app/
├─ components/
├─ lib/
```

### `app/`
Responsável por:

- páginas
- layouts
- navegação

Exemplos:

- `app/page.tsx`
- `app/example/page.tsx`
- `app/auth/page.tsx`

### `components/`
Responsável por:

- componentes visuais reutilizáveis
- blocos menores da interface

Exemplos:

- header
- cards
- botões
- componentes de autenticação

### `lib/`
Responsável por:

- integração com auth
- integração com API
- tipos centrais
- helpers

Exemplos:

- `auth-client.ts`
- `api-fetch.ts`
- `types.ts`

---

## Quando usar Server Component e Client Component

### Server Component
Use quando:

- a página só precisa buscar dados
- não depende de clique, estado ou hook do navegador
- você quer buscar dados no servidor

Exemplo:
- página que carrega `/api/health`

### Client Component
Use quando:

- precisa de `useState`
- precisa de `useEffect`
- precisa de `onClick`
- precisa de hook de sessão
- precisa de interatividade do navegador

Exemplo:
- formulário de login
- menu do usuário
- botão de logout
- componente que usa `useSession`

---

## Fluxo ideal de desenvolvimento

### 1. Criar a página
Exemplo:

`src/app/examples/page.tsx`

### 2. Buscar dados com `apiFetch`
Exemplo:

```ts
const examples = await apiFetch("/api/examples");
```

### 3. Criar componentes menores se necessário
Exemplo:

- `ExampleCard`
- `ExampleList`
- `DashboardHeader`

### 4. Reaproveitar layout e utilidades existentes

---

## Como consumir a API

### Regra do projeto
Sempre que possível, use `apiFetch`.

Evite isso:

```ts
fetch("http://localhost:3333/api/examples")
```

Prefira isso:

```ts
apiFetch("/api/examples")
```

Motivos:

- evita repetir URL base
- centraliza headers
- centraliza `credentials: include`
- melhora manutenção
- facilita mudanças futuras

---

## Como trabalhar com autenticação

Tudo relacionado à sessão deve partir do `authClient`.

Exemplos:
- login
- logout
- cadastro
- leitura de sessão

Não espalhar lógica de auth pelo projeto.

---

## Como criar uma nova página

Exemplo: página de examples

### Arquivo
```txt
src/app/examples/page.tsx
```

### Exemplo
```tsx
import { apiFetch } from "@/lib/api-fetch";

export default async function ExamplesPage() {
  const data = await apiFetch("/api/examples");

  return (
    <div>
      <h1>Exemplos</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

---

## Como criar um componente client

Exemplo:
```tsx
"use client";

import { useState } from "react";

export function ExampleButton() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((prev) => prev + 1)}>
      Cliquei {count} vezes
    </button>
  );
}
```

---

## Boas práticas

- manter componentes pequenos
- evitar arquivos gigantes
- usar nomes claros
- separar layout de regra de negócio
- usar tipos
- reaproveitar componentes