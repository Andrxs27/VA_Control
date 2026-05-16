'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('usuarios', [
      {
        nombre: 'Administrador Principal',
        rol: 'admin',
        email: 'admin@vacontrol.com',
        password: '123456',
        config: null,
        active: true
      },
      {
        nombre: 'Valen Vendedor',
        rol: 'vendedor',
        email: 'valen@vacontrol.com',
        password: '123456',
        config: null,
        active: true
      },
      {
        nombre: 'Maria Tecnico',
        rol: 'tecnico',
        email: 'maria@vacontrol.com',
        password: '123456',
        config: null,
        active: true
      },
      {
        nombre: 'Andres Cliente',
        rol: 'cliente',
        email: 'andres@gmail.com',
        password: '123456',
        config: null,
        active: true
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};