'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE facturas (
        id SERIAL PRIMARY KEY,
        venta_id INT UNIQUE REFERENCES ventas(id),
        orden_servicio_id INT UNIQUE REFERENCES ordenes_servicio(id),
        subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
        descuento NUMERIC(10,2) NOT NULL DEFAULT 0,
        impuestos NUMERIC(10,2) NOT NULL DEFAULT 0,
        total NUMERIC(10,2) NOT NULL DEFAULT 0,
        notas TEXT,
        fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT factura_tiene_origen CHECK (
          (venta_id IS NOT NULL AND orden_servicio_id IS NULL) OR
          (venta_id IS NULL AND orden_servicio_id IS NOT NULL)
        )
      );
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('facturas');
  }
};