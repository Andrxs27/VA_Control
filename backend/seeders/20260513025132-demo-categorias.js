'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categorias', [
      {
        nombre: 'Computadores',
        descripcion: 'Laptops, PCs de escritorio y accesorios de cómputo',
        activo: true
      },
      {
        nombre: 'Celulares',
        descripcion: 'Smartphones y accesorios móviles',
        activo: true
      },
      {
        nombre: 'Audio',
        descripcion: 'Audífonos, parlantes y equipos de sonido',
        activo: true
      },
      {
        nombre: 'Cables y Adaptadores',
        descripcion: 'Cables USB, HDMI, adaptadores y cargadores',
        activo: true
      },
      {
        nombre: 'Gaming',
        descripcion: 'Controles, teclados, mouse y accesorios gamer',
        activo: true
      },
      {
        nombre: 'Televisores',
        descripcion: 'Smart TVs y accesorios para televisores',
        activo: true
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categorias', null, {});
  }
};