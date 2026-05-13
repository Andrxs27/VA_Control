'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clientes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      identificacion: {
        type: Sequelize.STRING(20),
        unique: true
      },
      telefono: {
        type: Sequelize.STRING(20)
      },
      correo: {
        type: Sequelize.STRING(150)
      },
      direccion: {
        type: Sequelize.TEXT
      },
      creado_en: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('clientes');
  }
};