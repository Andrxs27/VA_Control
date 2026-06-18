'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS historial_precio CASCADE;
      CREATE TABLE historial_precio (
        id SERIAL PRIMARY KEY,
        producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
        precio NUMERIC(10,2) NOT NULL,
        registrado_por INT REFERENCES usuarios(id),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('historial_precio');
  }
};