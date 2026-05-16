'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ventas', [
      {
        vendedor_id: 2,
        cliente_id: 4,
        total: 5200000.00,
        metodo_pago: 'efectivo',
        creado_en: new Date()
      },
      {
        vendedor_id: 2,
        cliente_id: 4,
        total: 3800000.00,
        metodo_pago: 'tarjeta',
        creado_en: new Date()
      },
      {
        vendedor_id: 2,
        cliente_id: 4,
        total: 2800000.00,
        metodo_pago: 'transferencia',
        creado_en: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ventas', null, {});
  }
};