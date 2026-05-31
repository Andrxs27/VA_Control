'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ventas', [
      {
        vendedor_id: 2,
        cliente_id: 1,
        subtotal: 5200000.00,
        descuento: 0,
        impuestos: 988000.00,
        total: 6188000.00,
        metodo_pago: 'efectivo',
        estado: 'completada',
        notas: null,
        creado_en: new Date()
      },
      {
        vendedor_id: 2,
        cliente_id: 2,
        subtotal: 3800000.00,
        descuento: 0,
        impuestos: 722000.00,
        total: 4522000.00,
        metodo_pago: 'tarjeta',
        estado: 'completada',
        notas: null,
        creado_en: new Date()
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ventas', null, {});
  }
};