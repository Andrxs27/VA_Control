'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS categoria_prod;
      DROP TYPE IF EXISTS enum_productos_categoria;
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE productos (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(50) UNIQUE,
        nombre VARCHAR(100) NOT NULL,
        categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('electronicos', 'repuestos', 'servicios')),
        stock INT DEFAULT 0,
        stock_minimo INT DEFAULT 5,
        precio_venta NUMERIC(10,2) NOT NULL,
        active BOOLEAN DEFAULT true
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('productos');
  }
};