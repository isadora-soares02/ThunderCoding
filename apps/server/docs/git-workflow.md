# Git Workflow

## 🌳 Estrutura de branches

- main → produção
- develop → integração
- feature/* → novas funcionalidades
- fix/* → correções
- docs/* → documentação

## 🔄 Fluxo padrão

1. git checkout develop
2. git pull
3. git checkout -b feature/nome
4. commit
5. push
6. pull request

## 🧠 Regras

- nunca commitar direto na main
- PR obrigatório
- nome de branch descritivo

## 🧑‍🤝‍🧑 Divisão do time

Exemplo:
- frontend
- backend
- docs
