'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE refresh_tokens (
        id SERIAL PRIMARY KEY,
        usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expira_en TIMESTAMP NOT NULL,
        revocado BOOLEAN DEFAULT false,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('refresh_tokens');
  }
};