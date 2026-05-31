'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE detalle_venta (
        id SERIAL PRIMARY KEY,
        venta_id INT NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
        producto_id INT NOT NULL REFERENCES productos(id),
        cantidad INT NOT NULL CHECK (cantidad > 0),
        precio_unitario NUMERIC(10,2) NOT NULL,
        descuento_item NUMERIC(10,2) DEFAULT 0,
        subtotal NUMERIC(10,2) NOT NULL
      );
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('detalle_venta');
  }
};