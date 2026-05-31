'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE historial_estado_orden (
        id SERIAL PRIMARY KEY,
        orden_id INT NOT NULL REFERENCES ordenes_servicio(id) ON DELETE CASCADE,
        estado VARCHAR(20) NOT NULL,
        comentario TEXT,
        usuario_id INT REFERENCES usuarios(id),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('historial_estado_orden');
  }
};