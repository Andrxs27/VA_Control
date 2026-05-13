'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('productos', [
      {
        sku: 'COMP-001',
        nombre: 'MacBook Air M2',
        categoria: 'electronico',
        stock: 10,
        stock_minimo: 3,
        precio_venta: 4500000.00,
        activo: true
      },
      {
        sku: 'COMP-002',
        nombre: 'Laptop Lenovo IdeaPad 5',
        categoria: 'electronico',
        stock: 8,
        stock_minimo: 2,
        precio_venta: 2800000.00,
        activo: true
      },
      {
        sku: 'CEL-001',
        nombre: 'iPhone 15 Pro',
        categoria: 'electronico',
        stock: 15,
        stock_minimo: 5,
        precio_venta: 5200000.00,
        activo: true
      },
      {
        sku: 'CEL-002',
        nombre: 'Samsung Galaxy S24',
        categoria: 'electronico',
        stock: 12,
        stock_minimo: 4,
        precio_venta: 3800000.00,
        activo: true
      },
      {
        sku: 'AUD-001',
        nombre: 'Audífonos Sony WH-1000XM5',
        categoria: 'accesorio',
        stock: 20,
        stock_minimo: 5,
        precio_venta: 1200000.00,
        activo: true
      },
      {
        sku: 'AUD-002',
        nombre: 'Parlante JBL Charge 5',
        categoria: 'accesorio',
        stock: 18,
        stock_minimo: 4,
        precio_venta: 850000.00,
        activo: true
      },
      {
        sku: 'CAB-001',
        nombre: 'Cable USB-C 2m',
        categoria: 'repuesto',
        stock: 50,
        stock_minimo: 10,
        precio_venta: 45000.00,
        activo: true
      },
      {
        sku: 'CAB-002',
        nombre: 'Adaptador HDMI a USB-C',
        categoria: 'accesorio',
        stock: 30,
        stock_minimo: 8,
        precio_venta: 120000.00,
        activo: true
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('productos', null, {});
  }
};