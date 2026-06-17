'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS log_ventas CASCADE;
      DROP TABLE IF EXISTS log_ordenes CASCADE;
      DROP TABLE IF EXISTS log_productos CASCADE;
      CREATE TABLE log_ventas (
        id_log SERIAL PRIMARY KEY,
        id_venta INT NOT NULL,
        accion VARCHAR(20) NOT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        usuario_bd VARCHAR(50) DEFAULT CURRENT_USER
      );

      CREATE TABLE log_ordenes (
        id_log SERIAL PRIMARY KEY,
        id_orden INT NOT NULL,
        accion VARCHAR(20) NOT NULL,
        estado_anterior VARCHAR(20),
        estado_nuevo VARCHAR(20),
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        usuario_bd VARCHAR(50) DEFAULT CURRENT_USER
      );

      CREATE TABLE log_productos (
        id_log SERIAL PRIMARY KEY,
        id_producto INT NOT NULL,
        accion VARCHAR(20) NOT NULL,
        precio_anterior NUMERIC(10,2),
        precio_nuevo NUMERIC(10,2),
        stock_anterior INT,
        stock_nuevo INT,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        usuario_bd VARCHAR(50) DEFAULT CURRENT_USER
      );
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('log_productos');
    await queryInterface.dropTable('log_ordenes');
    await queryInterface.dropTable('log_ventas');
  }
};