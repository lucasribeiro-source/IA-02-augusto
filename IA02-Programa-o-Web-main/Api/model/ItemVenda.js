const { DataTypes } = require("sequelize");
const db = require('../db/conn.js');
const Venda = require('./Venda.js');

// Guarda uma "foto" do produto no momento da venda (nome e preço),
// assim a venda continua correta mesmo se o produto for editado ou excluído depois.
const ItemVenda = db.define('ItemVenda',{
    produtoId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    preco: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

Venda.hasMany(ItemVenda, { foreignKey: 'vendaId', as: 'itens', onDelete: 'CASCADE' });
ItemVenda.belongsTo(Venda, { foreignKey: 'vendaId' });

module.exports = ItemVenda;
