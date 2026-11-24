const express = require('express');
const path = require('path');
const app = express();
const port = 5000;
const conn = require('./db/conn.js');
const cors = require('cors');

// limite maior porque a imagem do produto é enviada em base64 no JSON
app.use(express.json({ limit: '10mb' }));
app.use(cors({Credentials: true, origin: '*'}));

// imagens dos produtos ficam acessíveis em http://localhost:5000/uploads/<arquivo>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const ProdutoRouter = require('./router/ProdutoRouter.js');
const CarrinhoRouter = require('./router/CarrinhoRouter.js');
const VendaRouter = require('./router/VendaRouter.js');
app.use('/Produto', ProdutoRouter);
app.use('/Carrinho', CarrinhoRouter);
app.use('/Venda', VendaRouter);

conn
    .sync({ alter: true })
    .then(() => { app.listen(port)})
    .catch((err) => console.log(err));
