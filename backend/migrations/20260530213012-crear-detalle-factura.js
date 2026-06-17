'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS detalle_factura CASCADE;
      CREATE TABLE detalle_factura (
        id SERIAL PRIMARY KEY,
        factura_id INT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
        producto_id INT REFERENCES productos(id),
        descripcion VARCHAR(200),
        cantidad INT NOT NULL CHECK (cantidad > 0),
        precio_unitario NUMERIC(10,2) NOT NULL,
        descuento_item NUMERIC(10,2) DEFAULT 0,
        subtotal NUMERIC(10,2) NOT NULL
      );
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('detalle_factura');
  }
};