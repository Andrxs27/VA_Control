'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE categoria_prod AS ENUM ('electronicos', 'repuestos', 'servicios');
    `);

    await queryInterface.createTable('productos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sku: {
        type: Sequelize.STRING(50),
        unique: true
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      categoria: {
        type: Sequelize.ENUM('electronicos', 'repuestos', 'servicios'),
        allowNull: false
      },
      stock: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      stock_minimo: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      precio_venta: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('productos');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS categoria_prod;`);
  }
};