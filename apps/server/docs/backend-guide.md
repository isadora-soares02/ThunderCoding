# Backend Guide

## 🧠 Filosofia

Este backend foi feito para ser:
- simples
- didático
- escalável

## 🧩 Arquitetura

Cada módulo contém:
- routes.ts → entradas HTTP
- (opcional) service.ts → lógica
- (opcional) schema.ts → validação

## 🔄 Fluxo de uma requisição

1. Request chega
2. Validação (Zod)
3. Middleware (auth se necessário)
4. Lógica (Prisma)
5. Response

## 🔐 Autenticação

- Better Auth
- Sessão via cookie
- Middleware: requireSession

### Quando usar rota protegida?

- dados do usuário
- criação/edição/deleção

## 📦 CRUD padrão

| Método | Uso |
|------|-----|
| GET | listar |
| GET/:id | buscar |
| POST | criar |
| PUT | atualizar |
| DELETE | remover |

## 🧪 Exemplo de módulo

```ts
app.get("/", async () => {})
app.post("/", { preHandler: [requireSession] }, async () => {})
```

## ⚠️ Boas práticas

- sempre validar com Zod
- nunca acessar request.body direto
- separar rotas por domínio
- usar prefixos claros