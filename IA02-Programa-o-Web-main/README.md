# IA02 - Programação Web (CRUD de Produtos + Loja)

Projeto em duas partes: **Api** (Node + Express + Sequelize + MariaDB) e **Front-end** (React).

## Como rodar
1. Banco: MariaDB com um banco chamado `loja` (usuário `root`, senha `root` — ver `Api/db/conn.js`).
2. API: `cd Api && npm install && npm start` (porta 5000; as tabelas são criadas/atualizadas automaticamente).
3. Front: `cd Front-end && npm install && npm start` (porta 3000).

## Rotas do front
- `/home` — painel de vendas (vitrine, carrinho e finalização da compra)
- `/produtos` — CRUD de produtos (com imagem .jpeg/.png)

## Endpoints da API
**Produto** (`/Produto`): `POST /create`, `GET /getAll`, `GET /getById/:id`, `PATCH /update/:id`, `DELETE /delete/:id`
**Carrinho** (`/Carrinho`): `GET /getAll`, `POST /add`, `PATCH /update/:id`, `DELETE /delete/:id`, `DELETE /clear`
**Venda** (`/Venda`): `POST /finalizar`, `GET /getAll`, `GET /getById/:id`

## Validações
- Preço não aceita números negativos (front e API).
- Imagem aceita apenas `.jpeg` e `.png` (tipo e conteúdo conferidos na API; máx. 5MB).
