'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS rol_usuario;
      DROP TYPE IF EXISTS enum_usuarios_rol;
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'vendedor', 'tecnico', 'cliente')),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        config JSONB,
        active BOOLEAN DEFAULT true
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios');
  }
};