'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE detalle_factura (
        id SERIAL PRIMARY KEY,
        factura_id INT REFERENCES facturas(id) ON DELETE CASCADE,
        producto_id INT REFERENCES productos(id),
        cantidad INT NOT NULL,
        precio_unitario NUMERIC(10,2) NOT NULL
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('detalle_factura');
  }
};