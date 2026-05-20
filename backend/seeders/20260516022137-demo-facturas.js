'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('facturas', [
      {
        venta_id: 1,
        orden_servicio_id: null,
        detalle_productos_json: JSON.stringify([
          { producto: 'iPhone 15 Pro', cantidad: 1, precio: 5200000 }
        ]),
        impuestos: 988000.00,
        fecha_emision: new Date()
      },
      {
        venta_id: null,
        orden_servicio_id: 1,
        detalle_productos_json: JSON.stringify([
          { producto: 'Cambio de pantalla', cantidad: 1, precio: 150000 }
        ]),
        impuestos: 28500.00,
        fecha_emision: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('facturas', null, {});
  }
};