'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('usuarios', [
      {
        nombre: 'Administrador Principal',
        correo: 'admin@vacontrol.com',
        contrasena: '123456',
        rol: 'admin',
        activo: true,
        creado_en: new Date()
      },
      {
        nombre: 'Carlos Vendedor',
        correo: 'carlos@vacontrol.com',
        contrasena: '123456',
        rol: 'vendedor',
        activo: true,
        creado_en: new Date()
      },
      {
        nombre: 'Maria Tecnico',
        correo: 'maria@vacontrol.com',
        contrasena: '123456',
        rol: 'tecnico',
        activo: true,
        creado_en: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};