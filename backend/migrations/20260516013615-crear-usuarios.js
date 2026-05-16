'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE rol_usuario AS ENUM ('admin', 'vendedor', 'tecnico', 'cliente');
    `);

    await queryInterface.createTable('usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      rol: {
        type: Sequelize.ENUM('admin', 'vendedor', 'tecnico', 'cliente'),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      config: {
        type: Sequelize.JSONB
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS rol_usuario;`);
  }
};