'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ordenes_servicio', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clientes',
          key: 'id'
        }
      },
      tecnico_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        }
      },
      equipo: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      falla: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM('recibido', 'en_proceso', 'listo', 'entregado', 'cancelado'),
        defaultValue: 'recibido'
      },
      tipo_entrega: {
        type: Sequelize.ENUM('domicilio', 'en_tienda'),
        defaultValue: 'en_tienda'
      },
      fecha_promesa: {
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ordenes_servicio');
  }
};