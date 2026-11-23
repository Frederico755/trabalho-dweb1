# Biblioteca de Jogos — API REST (DWEB 1)

Backend em **Node.js + Express** com **PostgreSQL (Neon)**, **Prisma 7.10.0** (adaptador Neon),
autenticação **JWT** e senhas com **bcrypt**.

## O que instalar no Windows 11

1. **Node.js LTS** (v22 ou mais novo) — https://nodejs.org (já inclui o `npm`)
2. **Git** — https://git-scm.com (para enviar ao GitHub)
3. **VS Code** — https://code.visualstudio.com (opcional, recomendado)
4. **Postman**, **Insomnia** ou a extensão **Thunder Client** do VS Code (para testar as rotas)
5. Conta gratuita no **Neon** (https://neon.tech) e conta no **GitHub**

Confira no PowerShell: `node -v` e `npm -v`.

## Como rodar

```powershell
# 1. dentro da pasta do projeto, instale as dependências
npm install

# 2. crie o .env a partir do exemplo e preencha DATABASE_URL e JWT_SECRET
copy .env.example .env

# 3. crie as tabelas no Neon e gere o Prisma Client
npx prisma migrate dev --name inicial
npx prisma generate

# 4. inicie a API
npm run dev      # com recarregamento automático
npm start        # modo normal
```

A API sobe em `http://localhost:3000`.

> Se o `migrate dev` travar usando a URL "-pooler" do Neon, use a connection string
> **sem** "-pooler" (Direct connection) apenas para rodar a migration.

## Banco de dados (5 tabelas)

| Tabela | Descrição | Relações |
|---|---|---|
| `users` | Usuários (id, username, email único, password com hash) | 1:N com categorias, jogos e plataformas |
| `categorias` | Categoria do jogo (RPG, Ação...) | 1:N com jogos |
| `jogos` | Jogos da biblioteca | pertence a um user; N:N com plataformas |
| `plataformas` | PC, PS5, Switch... | pertence a um user; N:N com jogos |
| `jogos_plataformas` | Tabela associativa (N:N) com campo extra `horasJogadas` | liga jogo e plataforma (chave composta) |

## Rotas

Públicas:

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Cadastra usuário (`username`, `email`, `password`) |
| POST | `/auth/login` | Login (`email`, `password`), retorna `{ "token": "..." }` |

Protegidas (cabeçalho `Authorization: Bearer <token>`):

| Método | Rota | Descrição |
|---|---|---|
| GET | `/auth/me` | Dados do usuário logado (sem senha) |
| GET / POST | `/jogos` | Lista / cria jogo (`titulo`, `descricao`, `anoLancamento`, `categoriaId`) |
| GET / PUT / DELETE | `/jogos/:id` | Busca / atualiza / remove |
| GET / POST | `/plataformas` | Lista / cria plataforma (`nome`) |
| GET / PUT / DELETE | `/plataformas/:id` | Busca / atualiza / remove |
| GET / POST | `/categorias` | Lista / cria categoria (`nome`) |
| GET / PUT / DELETE | `/categorias/:id` | Busca / atualiza / remove |
| POST | `/jogos/:id/plataformas/:plataformaId` | Associa jogo a plataforma (body opcional: `horasJogadas`) |
| GET | `/jogos/:id/plataformas` | Plataformas de um jogo |
| GET | `/plataformas/:id/jogos` | Jogos de uma plataforma |
| DELETE | `/jogos/:id/plataformas/:plataformaId` | Remove a associação |

Códigos usados: 200, 201, 400, 401, 403, 404, 409, 500.
Cada usuário só vê e altera os próprios registros (acesso a registro de outro usuário retorna 403).

## Roteiro para a apresentação

1. `POST /auth/register` — cadastro (mostrar que a resposta não traz a senha; no banco ela está com hash)
2. `POST /auth/login` — copiar o token
3. `GET /jogos` **sem** token → 401; **com** token → 200
4. Criar uma categoria, um jogo e uma plataforma
5. `POST /jogos/:id/plataformas/:plataformaId` — criar o N:N; depois os dois `GET` do relacionamento
6. `DELETE` da associação

## Estrutura

```
prisma/schema.prisma       modelos e relações
prisma.config.ts           URL do banco para o Prisma CLI
src/server.js              app Express, cors, rotas
src/prisma.js              PrismaClient com adaptador Neon
src/middlewares/auth.js    verificação do JWT (define req.userId)
src/routes/                auth, jogos, plataformas, categorias
```
