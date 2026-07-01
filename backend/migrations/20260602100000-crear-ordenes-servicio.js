'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS ordenes_servicio CASCADE;
      CREATE TABLE ordenes_servicio (
        id SERIAL PRIMARY KEY,
        cliente_id INT NOT NULL,
        tecnico_id INT,
        equipo VARCHAR(255) NOT NULL,
        marca VARCHAR(100) NOT NULL,
        modelo VARCHAR(100) NOT NULL,
        serial_equipo VARCHAR(100),
        falla TEXT NOT NULL,
        diagnostico TEXT,
        estado VARCHAR(30) NOT NULL CHECK (estado IN ('pendiente', 'en_proceso', 'terminado', 'entregado', 'cancelado')),
        tipo_entrega VARCHAR(30) NOT NULL CHECK (tipo_entrega IN ('tienda', 'domicilio')),
        fecha_promesa DATE,
        costo_servicio NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        notas TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ordenes_servicio');
  }
};