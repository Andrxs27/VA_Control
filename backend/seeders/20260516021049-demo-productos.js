'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('productos', [
      {
        sku: 'COMP-001',
        nombre: 'MacBook Air M2',
        categoria: 'electronicos',
        stock: 10,
        stock_minimo: 3,
        precio_venta: 4500000.00,
        active: true
      },
      {
        sku: 'COMP-002',
        nombre: 'Laptop Lenovo IdeaPad 5',
        categoria: 'electronicos',
        stock: 8,
        stock_minimo: 2,
        precio_venta: 2800000.00,
        active: true
      },
      {
        sku: 'CEL-001',
        nombre: 'iPhone 15 Pro',
        categoria: 'electronicos',
        stock: 15,
        stock_minimo: 5,
        precio_venta: 5200000.00,
        active: true
      },
      {
        sku: 'CEL-002',
        nombre: 'Samsung Galaxy S24',
        categoria: 'electronicos',
        stock: 12,
        stock_minimo: 4,
        precio_venta: 3800000.00,
        active: true
      },
      {
        sku: 'REP-001',
        nombre: 'Pantalla iPhone 13',
        categoria: 'repuestos',
        stock: 20,
        stock_minimo: 5,
        precio_venta: 450000.00,
        active: true
      },
      {
        sku: 'REP-002',
        nombre: 'Batería Samsung S21',
        categoria: 'repuestos',
        stock: 25,
        stock_minimo: 5,
        precio_venta: 180000.00,
        active: true
      },
      {
        sku: 'SER-001',
        nombre: 'Cambio de pantalla',
        categoria: 'servicios',
        stock: 999,
        stock_minimo: 1,
        precio_venta: 150000.00,
        active: true
      },
      {
        sku: 'SER-002',
        nombre: 'Limpieza de placa',
        categoria: 'servicios',
        stock: 999,
        stock_minimo: 1,
        precio_venta: 80000.00,
        active: true
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('productos', null, {});
  }
};