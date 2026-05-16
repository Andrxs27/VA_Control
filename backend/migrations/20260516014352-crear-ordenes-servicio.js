'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS estado_servicio;
      DROP TYPE IF EXISTS estado_entrega;
      CREATE TYPE estado_servicio AS ENUM ('pendiente', 'en_proceso', 'completado', 'entregado');
      CREATE TYPE estado_entrega AS ENUM ('domicilio', 'tienda');
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE ordenes_servicio (
        id SERIAL PRIMARY KEY,
        cliente_id INT REFERENCES usuarios(id),
        tecnico_id INT REFERENCES usuarios(id),
        equipo VARCHAR(100) NOT NULL,
        falla TEXT,
        estado estado_servicio DEFAULT 'pendiente',
        tipo_entrega estado_entrega,
        fecha_promesa DATE
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ordenes_servicio');
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS estado_servicio;
      DROP TYPE IF EXISTS estado_entrega;
    `);
  }
};