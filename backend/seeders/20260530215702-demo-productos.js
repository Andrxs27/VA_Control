'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('productos', [
      {
        sku: 'COMP-001',
        nombre: 'MacBook Air M2',
        descripcion: 'Laptop Apple con chip M2',
        categoria: 'electronicos',
        stock: 10,
        stock_minimo: 3,
        precio_venta: 4500000.00,
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        sku: 'CEL-001',
        nombre: 'iPhone 15 Pro',
        descripcion: 'Smartphone Apple última generación',
        categoria: 'electronicos',
        stock: 15,
        stock_minimo: 5,
        precio_venta: 5200000.00,
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        sku: 'CEL-002',
        nombre: 'Samsung Galaxy S24',
        descripcion: 'Smartphone Samsung flagship',
        categoria: 'electronicos',
        stock: 2,
        stock_minimo: 5,
        precio_venta: 3800000.00,
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        sku: 'REP-001',
        nombre: 'Pantalla iPhone 13',
        descripcion: 'Pantalla de repuesto original',
        categoria: 'repuestos',
        stock: 20,
        stock_minimo: 5,
        precio_venta: 450000.00,
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        sku: 'SER-001',
        nombre: 'Cambio de pantalla',
        descripcion: 'Servicio de cambio de pantalla',
        categoria: 'servicios',
        stock: 999,
        stock_minimo: 1,
        precio_venta: 150000.00,
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('productos', null, {});
  }
};