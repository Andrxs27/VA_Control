'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('usuarios', [
      {
        nombre: 'Administrador Principal',
        email: 'admin@vacontrol.com',
        password: '123456',
        rol: 'admin',
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        nombre: 'Carlos Vendedor',
        email: 'carlos@vacontrol.com',
        password: '123456',
        rol: 'vendedor',
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        nombre: 'Maria Tecnico',
        email: 'maria@vacontrol.com',
        password: '123456',
        rol: 'tecnico',
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};