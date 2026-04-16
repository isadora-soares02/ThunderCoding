# ThunderCoding Web

Frontend da plataforma ThunderCoding.

Este projeto foi preparado para servir como base de desenvolvimento do time.
A ideia é que a estrutura inicial já esteja pronta para o grupo focar em:

- criar páginas
- evoluir layout
- consumir a API
- implementar autenticação no frontend
- organizar componentes e features

---

## Objetivo do frontend

O frontend é responsável por:

- interface da plataforma
- navegação entre páginas
- consumo das rotas do backend
- autenticação do usuário via Better Auth
- exibição de trilhas, desafios, progresso e ranking
- experiência visual da aplicação

---

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Better Auth Client
- Fetch API centralizada via `apiFetch`

---

## Como rodar localmente

Dentro de `apps/web`:

```bash
npm install
npm run dev
```

---

## Variáveis de ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Explicação

- `NEXT_PUBLIC_API_URL`: URL do backend Fastify
- `NEXT_PUBLIC_APP_URL`: URL do frontend Next.js

Essas variáveis precisam existir para:

- o `authClient` funcionar corretamente
- o `apiFetch` saber para qual API enviar as requisições

---

## Estrutura principal

```txt
src/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ example/
│  │  └─ page.tsx
│  └─ auth/
│     └─ page.tsx
├─ components/
│  ├─ layout/
│  └─ auth/
├─ lib/
│  ├─ auth-client.ts
│  ├─ api-fetch.ts
│  ├─ types.ts
│  └─ env.ts
```

### O que cada pasta faz

- `app/`: páginas e layouts do App Router
- `components/`: componentes reutilizáveis
- `lib/`: utilidades centrais, cliente de auth, fetch da API e tipos

---

## Arquivos importantes

### `src/lib/auth-client.ts`
Cliente central do Better Auth no frontend.

### `src/lib/api-fetch.ts`
Função central para chamadas HTTP ao backend.

### `src/app/example/page.tsx`
Página de exemplo consumindo uma rota pública da API.

### `src/app/auth/page.tsx`
Página de exemplo mostrando leitura de sessão com Better Auth.

### `src/components/auth/session-status.tsx`
Componente client de exemplo para autenticação.

---

## Regras do projeto

### 1. Não espalhar `fetch` pelo projeto inteiro
Sempre que possível, usar `apiFetch`.

### 2. Não criar lógica de autenticação em qualquer lugar
Tudo relacionado a sessão deve partir do `authClient`.

### 3. Componentes devem ter responsabilidade clara
Exemplo:

- layout = estrutura
- page = tela
- lib = utilidades
- auth = sessão/autenticação

### 4. Criar páginas simples primeiro
Não tentar montar tudo de uma vez.
Começar com base funcional.

---

## Como o time deve trabalhar em cima dessa base

### O que já está pronto
- estrutura inicial
- layout base
- navegação base
- client de autenticação
- função de fetch centralizada
- página de exemplo conectada ao backend

### O que o time pode fazer agora
- criar novas páginas
- criar telas reais do produto
- consumir rotas novas do backend
- evoluir layout e design
- implementar fluxos reais de login/cadastro

---

## Páginas que podem ser criadas depois

- `/dashboard`
- `/tracks`
- `/tracks/[id]`
- `/challenges`
- `/ranking`
- `/profile`
- `/settings`

---

## Documentação complementar

Veja a pasta `docs/`:

- `docs/frontend-guide.md`
- `docs/auth-client-guide.md`
- `docs/api-fetch-guide.md`
- `docs/frontend-structure.md`
- `docs/onboarding-frontend.md`
- `docs/frontend-workflow.md`

---

## Padrão de branch

- `main` = estável
- `develop` = integração
- `feature/frontend-layout`
- `feature/frontend-dashboard`
- `feature/frontend-auth`
- `docs/frontend-guide`

---

## Padrão de commit

```txt
feat: create example page consuming api
feat: configure better auth client
feat: add app shell layout
docs: add frontend guide
refactor: move api fetch to lib folder
chore: configure environment variables
```