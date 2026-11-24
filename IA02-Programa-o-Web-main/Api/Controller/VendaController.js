const db = require('../db/conn.js');
const Produto = require('../model/Produto');
const CarrinhoItem = require('../model/CarrinhoItem');
const Venda = require('../model/Venda');
const ItemVenda = require('../model/ItemVenda');

module.exports = class VendaController {
    // Finaliza a venda: transforma o carrinho em uma venda e esvazia o carrinho
    static async finalizar(req, res) {
        try {
            const venda = await db.transaction(async (t) => {
                const itens = await CarrinhoItem.findAll({
                    include: [{ model: Produto }],
                    transaction: t
                });

                if (itens.length === 0) {
                    const erro = new Error('O carrinho está vazio!');
                    erro.status = 422;
                    throw erro;
                }

                const total = itens.reduce(
                    (soma, item) => soma + Number(item.Produto.preco) * item.quantidade, 0
                );

                const nova = await Venda.create({ total: total.toFixed(2) }, { transaction: t });

                await ItemVenda.bulkCreate(
                    itens.map((item) => ({
                        vendaId: nova.id,
                        produtoId: item.produtoId,
                        nome: item.Produto.nome,
                        preco: item.Produto.preco,
                        quantidade: item.quantidade
                    })),
                    { transaction: t }
                );

                await CarrinhoItem.destroy({ where: {}, transaction: t });
                return nova;
            });

            const completa = await Venda.findByPk(venda.id, { include: [{ model: ItemVenda, as: 'itens' }] });
            res.status(201).json({ message: 'Venda finalizada com sucesso!', venda: completa });
        } catch (err) {
            res.status(err.status || 500).json({ message: err.status ? err.message : 'Erro ao finalizar a venda: ' + err });
        }
    }

    static async getAll(req, res) {
        try {
            const vendas = await Venda.findAll({
                include: [{ model: ItemVenda, as: 'itens' }],
                order: [['id', 'DESC']]
            });
            res.status(200).json(vendas);
        } catch (err) {
            res.status(500).json({ message: 'Erro ao buscar as vendas: ' + err });
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const venda = await Venda.findByPk(id, { include: [{ model: ItemVenda, as: 'itens' }] });
            if (!venda) {
                res.status(422).json({ message: 'Venda não encontrada!' });
                return;
            }
            res.status(200).json(venda);
        } catch (err) {
            res.status(500).json({ message: 'Erro ao buscar a venda: ' + err });
        }
    }
};
