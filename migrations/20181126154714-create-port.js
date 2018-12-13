'use strict';

var prov = require('../models/Prov');
var provone = require('../models/ProvONE');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(provone.Classes.PORT.toLowerCase(), {
      port_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      label: {
        type: Sequelize.STRING
      },
      workflow_identifier: {
        type: Sequelize.STRING
      },
      port_type: {
        type: Sequelize.ENUM('in', 'out')
      },
      provone_hasinport: {
        type: Sequelize.INTEGER
      },
      provone_hasoutport: {
        type: Sequelize.INTEGER
      },
      provone_hasdefaultparam: {
        type: Sequelize.INTEGER
      }
    }).then(() => queryInterface.addConstraint(provone.Classes.PORT.toLowerCase(), ['port_id', 'workflow_identifier'], {
      type: 'primary key',
      name: 'Port_pkey'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(provone.Classes.PORT.toLowerCase());
  }
};