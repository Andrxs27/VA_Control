'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ordenes_servicio', [
      {
        cliente_id: 1,
        tecnico_id: 3,
        equipo: 'iPhone 13 negro',
        marca: 'Apple',
        modelo: 'iPhone 13',
        serial_equipo: 'SN123456',
        falla: 'Pantalla rota',
        diagnostico: null,
        estado: 'pendiente',
        tipo_entrega: 'tienda',
        fecha_promesa: '2026-06-10',
        costo_servicio: 150000.00,
        notas: null,
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        cliente_id: 2,
        tecnico_id: 3,
        equipo: 'Samsung Galaxy S21',
        marca: 'Samsung',
        modelo: 'Galaxy S21',
        serial_equipo: 'SN789012',
        falla: 'No enciende',
        diagnostico: null,
        estado: 'en_proceso',
        tipo_entrega: 'domicilio',
        fecha_promesa: '2026-06-12',
        costo_servicio: 80000.00,
        notas: null,
        creado_en: new Date(),
        actualizado_en: new Date()
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ordenes_servicio', null, {});
  }
};