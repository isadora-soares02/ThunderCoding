# Frontend Workflow

## Objetivo

Este documento explica como deve trabalhar no frontend.

A ideia é reduzir bagunça, conflito de código e retrabalho.

---

## Estrutura de branches

- `main` → estável (produção)
- `develop` → integração
- `feature/*` → novas funcionalidades
- `fix/*` → correções
- `docs/*` → documentação

---

## Fluxo recomendado

### 1. Atualizar a branch de integração
```bash
git checkout develop
git pull origin develop
```

### 2. Criar uma branch nova
```bash
git checkout -b feature/frontend-dashboard
```

### 3. Desenvolver
Fazer a tarefa de forma focada.

### 4. Commitar
Usar commits claros.

### 5. Enviar para o repositório
```bash
git push -u origin feature/frontend-dashboard
```

### 6. Abrir Pull Request
Abrir PR para `develop`.

---

## Divisão de tarefas sugerida

Exemplo de divisão entre pessoas:

- pessoa 1 → layout base
- pessoa 2 → auth e páginas de acesso
- pessoa 3 → dashboard
- pessoa 4 → trilhas
- pessoa 5 → docs e componentes compartilhados

---

## Como evitar conflitos

- não editar tudo ao mesmo tempo
- cada pessoa focar numa área
- PR pequeno
- puxar `develop` com frequência

---

## Convenção de branches

### Exemplos
- `feature/frontend-layout`
- `feature/frontend-dashboard`
- `feature/frontend-auth`
- `docs/frontend-guide`

### Evitar
- `feature/teste`
- `feature/coisas`
- `branch-nova`
- `layout-final-agora-vai`

---

## Convenção de commits

### Exemplos
- `feat: create dashboard page`
- `feat: add api fetch helper`
- `feat: configure auth client`
- `docs: add frontend onboarding guide`
- `refactor: move layout component to shared folder`

---

## Checklist antes de abrir PR

- [ ] rodou o projeto
- [ ] não quebrou a navegação
- [ ] usou `apiFetch` quando necessário
- [ ] usou `authClient` quando necessário
- [ ] manteve nomes claros
- [ ] não deixou código solto
- [ ] explicou algo importante com comentário se necessário