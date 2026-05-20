'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ordenes_servicio', [
      {
        cliente_id: 4,
        tecnico_id: 3,
        equipo: 'iPhone 13 negro',
        falla: 'Pantalla rota',
        estado: 'pendiente',
        tipo_entrega: 'tienda',
        fecha_promesa: '2026-05-20'
      },
      {
        cliente_id: 4,
        tecnico_id: 3,
        equipo: 'Samsung Galaxy S21',
        falla: 'No enciende',
        estado: 'en_proceso',
        tipo_entrega: 'tienda',
        fecha_promesa: '2026-05-22'
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ordenes_servicio', null, {});
  }
};