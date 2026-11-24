const { DataTypes } = require("sequelize");
const db = require('../db/conn.js');
const Produto = require('./Produto.js');

const CarrinhoItem = db.define('CarrinhoItem',{
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1 }
    }
});

Produto.hasMany(CarrinhoItem, { foreignKey: 'produtoId', onDelete: 'CASCADE' });
CarrinhoItem.belongsTo(Produto, { foreignKey: 'produtoId' });

module.exports = CarrinhoItem;
