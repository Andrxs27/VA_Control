'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS ventas CASCADE;
      CREATE TABLE ventas (
        id SERIAL PRIMARY KEY,
        vendedor_id INT REFERENCES usuarios(id),
        cliente_id INT REFERENCES clientes(id),
        subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
        descuento NUMERIC(10,2) NOT NULL DEFAULT 0,
        impuestos NUMERIC(10,2) NOT NULL DEFAULT 0,
        total NUMERIC(10,2) NOT NULL DEFAULT 0,
        metodo_pago VARCHAR(50) CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'otro')),
        estado VARCHAR(20) DEFAULT 'completada' CHECK (estado IN ('borrador', 'completada', 'anulada')),
        notas TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ventas');
  }
};