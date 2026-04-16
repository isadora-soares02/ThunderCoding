# ThunderCoding Server

Backend da plataforma ThunderCoding.

## 🎯 Objetivo
Servir autenticação, usuários, trilhas, desafios, progresso e ranking.

## 🧱 Stack
- Fastify
- Better Auth
- Prisma
- PostgreSQL
- TypeScript

## ▶️ Como rodar

```bash
npm install
npx prisma generate
npm run dev
```

## 📁 Estrutura

- src/lib → integrações (auth, prisma, env)
- src/plugins → plugins do Fastify
- src/middlewares → auth, validação, etc
- src/modules → domínio (tracks, users, etc)
- prisma → banco de dados

## 🔗 Rotas base

- /api/health
- /api/auth/*
- /api/tracks
- /api/users

## 📚 Documentação

Veja:
- docs/backend-guide.md
- docs/git-workflow.md
- docs/commit-pattern.md