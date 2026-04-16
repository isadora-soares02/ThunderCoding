# Frontend Structure

## Objetivo

Este documento explica a estrutura do frontend e o papel de cada pasta.

---

## Estrutura principal

```txt
src/
├─ app/
├─ components/
├─ lib/
```

---

## `app/`

Aqui ficam:

- páginas
- layouts
- rotas do App Router

Exemplos:
- `app/page.tsx`
- `app/example/page.tsx`
- `app/auth/page.tsx`
- `app/dashboard/page.tsx`

### Quando criar algo em `app/`
Quando for:
- uma página
- um layout
- uma rota visual do sistema

---

## `components/`

Aqui ficam componentes reutilizáveis.

Exemplos:
- header
- menu
- cards
- tabelas
- formulários
- componentes de autenticação

### Organização recomendada

```txt
components/
├─ layout/
├─ auth/
├─ ui/
└─ dashboard/
```

---

## `lib/`

Aqui ficam utilidades centrais do sistema.

Exemplos:
- `auth-client.ts`
- `api-fetch.ts`
- `types.ts`

### Regra
Tudo que for base técnica e usado em vários lugares
deve ir para `lib/`.

---

## Como pensar antes de criar um arquivo

Pergunte:

### É uma página?
Vai em `app/`.

### É um componente reutilizável?
Vai em `components/`.

### É uma utilidade central?
Vai em `lib/`.

### É algo muito específico de uma feature?
Pode virar pasta de domínio depois.

---

## Padrão de nomes

Use nomes claros.

### Bons exemplos
- `app-header.tsx`
- `session-status.tsx`
- `api-fetch.ts`
- `auth-client.ts`

### Evitar
- `teste.tsx`
- `coisa.tsx`
- `util.ts`
- `paginaNova.tsx`

---

## Boas práticas

- manter nomes previsíveis
- separar páginas de componentes
- evitar misturar regra técnica com interface
- evitar arquivos gigantes