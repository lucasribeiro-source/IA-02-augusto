const { DataTypes } = require("sequelize");
const db = require('../db/conn.js');

const Venda = db.define('Venda',{
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
});

module.exports = Venda;
