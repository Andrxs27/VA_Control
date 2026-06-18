'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS ordenes_servicio CASCADE;
      CREATE TABLE ordenes_servicio (
        id SERIAL PRIMARY KEY,
        cliente_id INT REFERENCES clientes(id),
        tecnico_id INT REFERENCES usuarios(id),
        equipo VARCHAR(100) NOT NULL,
        marca VARCHAR(50),
        modelo VARCHAR(50),
        serial_equipo VARCHAR(100),
        falla TEXT,
        diagnostico TEXT,
        estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado', 'entregado', 'cancelado')),
        tipo_entrega VARCHAR(20) CHECK (tipo_entrega IN ('domicilio', 'tienda')),
        fecha_promesa DATE,
        costo_servicio NUMERIC(10,2) DEFAULT 0,
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