'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS estado_servicio;
      DROP TYPE IF EXISTS estado_entrega;
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE ordenes_servicio (
        id SERIAL PRIMARY KEY,
        cliente_id INT REFERENCES usuarios(id),
        tecnico_id INT REFERENCES usuarios(id),
        equipo VARCHAR(100) NOT NULL,
        falla TEXT,
        estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado', 'entregado')),
        tipo_entrega VARCHAR(20) CHECK (tipo_entrega IN ('domicilio', 'tienda')),
        fecha_promesa DATE
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ordenes_servicio');
  }
};