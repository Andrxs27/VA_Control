'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE movimientos_inventario (
        id SERIAL PRIMARY KEY,
        producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
        tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
        cantidad INT NOT NULL CHECK (cantidad > 0),
        stock_antes INT NOT NULL,
        stock_despues INT NOT NULL,
        motivo TEXT,
        usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_movimientos_producto ON movimientos_inventario(producto_id);
      CREATE INDEX idx_movimientos_fecha ON movimientos_inventario(creado_en DESC);
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_movimientos_fecha;
      DROP INDEX IF EXISTS idx_movimientos_producto;
    `);
    await queryInterface.dropTable('movimientos_inventario');
  }
};
