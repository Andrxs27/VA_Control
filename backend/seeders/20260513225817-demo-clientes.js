'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('clientes', [
      {
        nombre: 'Juan Pérez',
        identificacion: '1234567890',
        telefono: '3101234567',
        correo: 'juan@gmail.com',
        direccion: 'Calle 10 #20-30, Medellín',
        creado_en: new Date()
      },
      {
        nombre: 'Laura Gómez',
        identificacion: '9876543210',
        telefono: '3209876543',
        correo: 'laura@gmail.com',
        direccion: 'Carrera 50 #80-15, Medellín',
        creado_en: new Date()
      },
      {
        nombre: 'Empresa Tech SAS',
        identificacion: '900123456-1',
        telefono: '6044567890',
        correo: 'contacto@techsas.com',
        direccion: 'Av El Poblado #1-20, Medellín',
        creado_en: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('clientes', null, {});
  }
};