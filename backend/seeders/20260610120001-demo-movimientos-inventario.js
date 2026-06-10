'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtenemos los IDs reales de productos para referenciar correctamente
    const productos = await queryInterface.sequelize.query(
      `SELECT id, sku, stock FROM productos ORDER BY id LIMIT 5`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!productos.length) return;

    const usuarios = await queryInterface.sequelize.query(
      `SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const usuarioId = usuarios.length ? usuarios[0].id : null;

    const now = new Date();
    const hace = (dias, horas = 0) => {
      const d = new Date(now);
      d.setDate(d.getDate() - dias);
      d.setHours(d.getHours() - horas);
      return d;
    };

    const movimientos = [];

    if (productos[0]) {
      const p = productos[0];
      // Entrada inicial al sistema
      movimientos.push({
        producto_id: p.id,
        tipo: 'entrada',
        cantidad: 10,
        stock_antes: 0,
        stock_despues: 10,
        motivo: 'Stock inicial — carga al sistema',
        usuario_id: usuarioId,
        creado_en: hace(30)
      });
      // Salida por venta
      movimientos.push({
        producto_id: p.id,
        tipo: 'salida',
        cantidad: 2,
        stock_antes: 10,
        stock_despues: 8,
        motivo: 'Venta #001',
        usuario_id: usuarioId,
        creado_en: hace(5)
      });
    }

    if (productos[1]) {
      const p = productos[1];
      movimientos.push({
        producto_id: p.id,
        tipo: 'entrada',
        cantidad: 15,
        stock_antes: 0,
        stock_despues: 15,
        motivo: 'Compra proveedor — Factura #PRV-2026-01',
        usuario_id: usuarioId,
        creado_en: hace(20)
      });
      movimientos.push({
        producto_id: p.id,
        tipo: 'salida',
        cantidad: 3,
        stock_antes: 15,
        stock_despues: 12,
        motivo: 'Ventas semana — lote',
        usuario_id: usuarioId,
        creado_en: hace(2)
      });
    }

    if (productos[2]) {
      const p = productos[2];
      movimientos.push({
        producto_id: p.id,
        tipo: 'entrada',
        cantidad: 8,
        stock_antes: 0,
        stock_despues: 8,
        motivo: 'Stock inicial',
        usuario_id: usuarioId,
        creado_en: hace(25)
      });
      movimientos.push({
        producto_id: p.id,
        tipo: 'salida',
        cantidad: 6,
        stock_antes: 8,
        stock_despues: 2,
        motivo: 'Ventas — stock bajo',
        usuario_id: usuarioId,
        creado_en: hace(3)
      });
    }

    if (productos[3]) {
      const p = productos[3];
      movimientos.push({
        producto_id: p.id,
        tipo: 'entrada',
        cantidad: 20,
        stock_antes: 0,
        stock_despues: 20,
        motivo: 'Compra repuestos — Factura #PRV-2026-02',
        usuario_id: usuarioId,
        creado_en: hace(15)
      });
      movimientos.push({
        producto_id: p.id,
        tipo: 'ajuste',
        cantidad: 2,
        stock_antes: 20,
        stock_despues: 18,
        motivo: 'Ajuste por inventario físico — diferencia detectada',
        usuario_id: usuarioId,
        creado_en: hace(1)
      });
    }

    if (productos[4]) {
      const p = productos[4];
      movimientos.push({
        producto_id: p.id,
        tipo: 'entrada',
        cantidad: 100,
        stock_antes: 0,
        stock_despues: 100,
        motivo: 'Capacidad de servicio habilitada',
        usuario_id: usuarioId,
        creado_en: hace(30)
      });
    }

    await queryInterface.bulkInsert('movimientos_inventario', movimientos);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('movimientos_inventario', null, {});
  }
};
