'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE productos (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(50) UNIQUE,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('electronicos', 'repuestos', 'servicios')),
        stock INT DEFAULT 0,
        stock_minimo INT DEFAULT 5,
        precio_venta NUMERIC(10,2) NOT NULL,
        activo BOOLEAN DEFAULT true,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('productos');
  }
};