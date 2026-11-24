const Produto = require('../model/Produto');
const { salvarImagem, removerImagem } = require('../util/imagem');

// Valida o preço: obrigatório, numérico e nunca negativo. Retorna a mensagem de erro ou null.
function validarPreco(preco) {
    if (preco === undefined || preco === null || preco === '') return 'O preço é obrigatório!';
    const valor = Number(preco);
    if (Number.isNaN(valor)) return 'O preço deve ser um número!';
    if (valor < 0) return 'O preço não pode ser negativo!';
    return null;
}

module.exports = class ProdutoController {
    static async create(req, res) {
        const {nome, preco, imagem} = req.body;

        if(!nome){
            res.status(422).json({ message: 'O nome é obrigatório!' });
            return;
        }

        const erroPreco = validarPreco(preco);
        if(erroPreco){
            res.status(422).json({ message: erroPreco });
            return;
        }

        let arquivo = null;
        if (imagem) {
            try {
                arquivo = salvarImagem(imagem);
            } catch (err) {
                res.status(422).json({ message: err.message });
                return;
            }
        }

        const produto = new Produto({
            nome: nome,
            preco: preco,
            imagem: arquivo
        });

        try {
            await produto.save();
            res.status(201).json({message: 'Produto criado com sucesso', produto });
        } catch (err) {
            removerImagem(arquivo);
            res.status(500).json({message: 'Erro ao criar o produto: ' + err });
        }
    }

    static async getAll(req, res) {
            try {
                const produtos = await Produto.findAll();
                res.status(200).json(produtos);
        }
        catch (err) {
                res.status(500).json({ message: 'Erro ao buscar os produtos:' +
                    err });
        }
    }

    static async getById(req, res){
        const {id} = req.params;

        const produto = await Produto.findByPk(id);

        if (!produto) {
            res.status(422).json({message: 'Produto não encontrado!'});
            return;
        }

        res.status(200).json(produto);
    }

    static async update(req, res){
        const {id} = req.params;
        const {nome, preco, imagem} = req.body;

        const produto = await Produto.findByPk(id);
        if(!produto){
            res.status(422).json({message: "Produto não encontrado"});
            return;
        }

        if (nome !== undefined && !nome) {
            res.status(422).json({ message: 'O nome é obrigatório!' });
            return;
        }

        if (preco !== undefined) {
            const erroPreco = validarPreco(preco);
            if (erroPreco) {
                res.status(422).json({ message: erroPreco });
                return;
            }
        }

        const dados = {};
        if (nome !== undefined) dados.nome = nome;
        if (preco !== undefined) dados.preco = preco;

        // "imagem" só é enviada quando o usuário escolhe uma nova
        let novaImagem = null;
        if (imagem) {
            try {
                novaImagem = salvarImagem(imagem);
                dados.imagem = novaImagem;
            } catch (err) {
                res.status(422).json({ message: err.message });
                return;
            }
        }

        const imagemAntiga = produto.imagem;
        try {
            await produto.update(dados);
            if (novaImagem) removerImagem(imagemAntiga);
            res.status(200).json({message: 'Produto atualizado com sucesso', produto});
        } catch (err) {
            removerImagem(novaImagem);
            res.status(500).json({message: 'Erro ao atualizar o produto' + err});
        }
    }

    static async delete(req, res) {
        const {id} = req.params;
        const produto = await Produto.findByPk(id);
        if (!produto){
            res.status(422).json({message: "Produto não encontrado"});
            return;
        }
        try {
            const imagem = produto.imagem;
            await produto.destroy();
            removerImagem(imagem);
            res.status(200).json({message: 'Produto deletado com sucesso!'});
        } catch (err) {
            res.status(500).json({message: 'Erro ao deletar o produto' + err});
        }
    }
};
