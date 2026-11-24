const Produto = require('../model/Produto');
const CarrinhoItem = require('../model/CarrinhoItem');

// Monta a resposta padrão do carrinho: itens + total
async function montarCarrinho() {
    const itens = await CarrinhoItem.findAll({
        include: [{ model: Produto }],
        order: [['id', 'ASC']]
    });
    const total = itens.reduce(
        (soma, item) => soma + Number(item.Produto.preco) * item.quantidade, 0
    );
    return { itens, total: Number(total.toFixed(2)) };
}

module.exports = class CarrinhoController {
    static async getAll(req, res) {
        try {
            res.status(200).json(await montarCarrinho());
        } catch (err) {
            res.status(500).json({ message: 'Erro ao buscar o carrinho: ' + err });
        }
    }

    // Adiciona um produto ao carrinho (se já estiver lá, soma a quantidade)
    static async add(req, res) {
        const { produtoId } = req.body;
        const quantidade = req.body.quantidade === undefined ? 1 : Number(req.body.quantidade);

        if (!produtoId) {
            res.status(422).json({ message: 'O produto é obrigatório!' });
            return;
        }
        if (!Number.isInteger(quantidade) || quantidade < 1) {
            res.status(422).json({ message: 'A quantidade deve ser um número inteiro maior que zero!' });
            return;
        }

        try {
            const produto = await Produto.findByPk(produtoId);
            if (!produto) {
                res.status(422).json({ message: 'Produto não encontrado!' });
                return;
            }

            const existente = await CarrinhoItem.findOne({ where: { produtoId } });
            if (existente) {
                await existente.update({ quantidade: existente.quantidade + quantidade });
            } else {
                await CarrinhoItem.create({ produtoId, quantidade });
            }
            res.status(201).json(await montarCarrinho());
        } catch (err) {
            res.status(500).json({ message: 'Erro ao adicionar ao carrinho: ' + err });
        }
    }

    // Altera a quantidade de um item do carrinho
    static async update(req, res) {
        const { id } = req.params;
        const quantidade = Number(req.body.quantidade);

        if (!Number.isInteger(quantidade) || quantidade < 1) {
            res.status(422).json({ message: 'A quantidade deve ser um número inteiro maior que zero!' });
            return;
        }

        try {
            const item = await CarrinhoItem.findByPk(id);
            if (!item) {
                res.status(422).json({ message: 'Item não encontrado no carrinho!' });
                return;
            }
            await item.update({ quantidade });
            res.status(200).json(await montarCarrinho());
        } catch (err) {
            res.status(500).json({ message: 'Erro ao atualizar o carrinho: ' + err });
        }
    }

    // Remove um item do carrinho
    static async delete(req, res) {
        const { id } = req.params;
        try {
            const item = await CarrinhoItem.findByPk(id);
            if (!item) {
                res.status(422).json({ message: 'Item não encontrado no carrinho!' });
                return;
            }
            await item.destroy();
            res.status(200).json(await montarCarrinho());
        } catch (err) {
            res.status(500).json({ message: 'Erro ao remover do carrinho: ' + err });
        }
    }

    // Esvazia o carrinho
    static async clear(req, res) {
        try {
            await CarrinhoItem.destroy({ where: {} });
            res.status(200).json({ itens: [], total: 0 });
        } catch (err) {
            res.status(500).json({ message: 'Erro ao limpar o carrinho: ' + err });
        }
    }
};
