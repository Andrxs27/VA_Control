'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE facturas (
        id SERIAL PRIMARY KEY,
        venta_id INT UNIQUE REFERENCES ventas(id),
        orden_servicio_id INT UNIQUE REFERENCES ordenes_servicio(id),
        detalle_productos_json JSONB,
        impuestos NUMERIC(10,2) DEFAULT 0,
        fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('facturas');
  }
};