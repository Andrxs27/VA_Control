'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('clientes', [
      {
        nombre: 'Juan Pérez',
        email: 'juan@gmail.com',
        identificacion: '1234567890',
        telefono: '3101234567',
        direccion: 'Calle 10 #20-30, Medellín',
        notas: 'Cliente frecuente',
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        nombre: 'Laura Gómez',
        email: 'laura@gmail.com',
        identificacion: '12345678',
        telefono: '3209876543',
        direccion: 'Carrera 50 #80-15, Medellín',
        notas: null,
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        nombre: 'Empresa Tech SAS',
        email: 'contacto@techsas.com',
        identificacion: '987654321',
        telefono: '6044567890',
        direccion: 'Av El Poblado #1-20, Medellín',
        notas: 'Cliente corporativo',
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('clientes', null, {});
  }
};