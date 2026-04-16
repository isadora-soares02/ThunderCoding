# API Fetch Guide

## Objetivo

Este documento explica como o frontend deve consumir a API do backend.

A regra principal é:

**não espalhar `fetch` cru pelo projeto inteiro.**

Em vez disso, usar a função central:

```txt
src/lib/api-fetch.ts
```

---

## Por que criamos o `apiFetch`

Centralizar a comunicação com a API ajuda a:

- evitar repetição
- manter a URL base em um lugar só
- manter headers em um lugar só
- incluir cookies/sessão automaticamente
- padronizar tratamento de erro

---

## Exemplo base

```ts
const data = await apiFetch("/api/examples");
```

---

## Estrutura da função

O `apiFetch` normalmente cuida de:

- URL base
- método HTTP
- headers
- `credentials: include`
- tratamento de erro
- parse de resposta

---

## Como usar em página Server Component

```tsx
import { apiFetch } from "@/lib/api-fetch";

export default async function ExamplesPage() {
  const data = await apiFetch("/api/examples");

  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  );
}
```

---

## Como usar em Client Component

```tsx
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-fetch";

export function ExampleClientList() {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    apiFetch("/api/examples").then(setData);
  }, []);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

---

## Requisição GET

```ts
const examples = await apiFetch("/api/examples");
```

---

## Requisição POST

```ts
await apiFetch("examples", {
  method: "POST",
  body: JSON.stringify({
    title: "Novo Exemplo",
    description: "Descrição do exemplo",
    level: "beginner",
  }),
});
```

---

## Requisição PUT

```ts
await apiFetch("/api/examples/123", {
  method: "PUT",
  body: JSON.stringify({
    title: "Título atualizado",
  }),
});
```

---

## Requisição DELETE

```ts
await apiFetch("/api/examples/123", {
  method: "DELETE",
});
```

---

## Tratamento de erro

Quando uma requisição falhar, o ideal é:

- mostrar mensagem amigável
- evitar quebrar a tela inteira
- entender o motivo do erro

Exemplo simples:

```ts
try {
  const data = await apiFetch("/api/examples");
  console.log(data);
} catch (error) {
  console.error(error);
}
```

---

## Quando usar `apiFetch`

Use quando:
- quiser consumir o backend
- quiser chamar rotas autenticadas
- quiser manter o padrão do projeto

---

## Quando evitar `fetch` cru

Evite quando:
- estiver fazendo chamadas normais para a API do projeto
- a lógica puder passar pelo `apiFetch`

---

## Boas práticas

- usar sempre caminhos curtos como `/api/examples`
- manter tipagem das respostas (opcional, mas ideal)
- tratar erro
- reaproveitar a função central
- não repetir URL base