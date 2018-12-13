'use strict';

var prov = require('../models/Prov');
var provone = require('../models/ProvONE');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(prov.Classes.ENTITY.toLowerCase(), {
      entity_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      label: {
        type: Sequelize.STRING
      },
      workflow_identifier: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      value: {
        type: Sequelize.STRING
      },
      entity_type: {
        type: Sequelize.ENUM(provone.Classes.DATA, provone.Classes.DOCUMENT, provone.Classes.VISUALIZATION)
      },
      prov_hadmember: {
        type: Sequelize.INTEGER
      },
      prov_wasgeneratedby: {
        type: Sequelize.INTEGER
      },
      prov_used: {
        type: Sequelize.INTEGER
      }
    }).then(() => queryInterface.addConstraint(prov.Classes.ENTITY.toLowerCase(), ['entity_id', 'workflow_identifier'], {
      type: 'primary key',
      name: 'Entity_pkey'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(prov.Classes.ENTITY.toLowerCase());
  }
};