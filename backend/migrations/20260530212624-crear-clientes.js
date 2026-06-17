'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS clientes CASCADE;
      CREATE TABLE clientes (
        id SERIAL PRIMARY KEY,
        identificacion VARCHAR(50) UNIQUE NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        telefono VARCHAR(20),
        direccion TEXT,
        tipo VARCHAR(20) DEFAULT 'particular', -- Cambiado de 'tipo_cliente' a 'tipo' para coincidir con tu backend
        notas TEXT,
        activo BOOLEAN DEFAULT true,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('clientes');
  }
};