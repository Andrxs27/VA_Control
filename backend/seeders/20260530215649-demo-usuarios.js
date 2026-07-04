'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('usuarios', [
      {
        nombre: 'Administrador Principal',
        email: 'admin@vacontrol.com',
        password: '$2b$10$whoQ8loKx44zRf6Dk.IBde.BXPLoTZ23bAUnsmh2ourJT61ULgdha',
        rol: 'admin',
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        nombre: 'Carlos Vendedor',
        email: 'carlos@vacontrol.com',
        password: '$2b$10$07QS/o.oJyWN9UACaYT5BOseIEoTkzJMZULLOUz33rp5qH2m9ZxcK',
        rol: 'vendedor',
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        nombre: 'Maria Tecnico',
        email: 'maria@vacontrol.com',
        password: '$2b$10$hd1tCN9REH/64IFleDXI4u6nAI.ZatIWB0scKM0f16YtC3fMKYP1q',
        rol: 'tecnico',
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      },

      {
        nombre: 'Andres Saenz',
        email: 'andrecrack1110@gmail.com',
        password: '$2b$10$xSXdT9gtQEHUKvd3quvlEO5qcjKzDDf.XuYDwPTWmiVD3c4YQeQwO',
        rol: 'admin',
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