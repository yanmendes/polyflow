'use strict';

var prov = require('../models/Prov');
var provone = require('../models/ProvONE');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(prov.Classes.GENERATION.toLowerCase(), {
      generation_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      label: {
        type: Sequelize.STRING
      },
      workflow_identifier: {
        type: Sequelize.STRING
      },
      provone_hadoutport: {
        type: Sequelize.INTEGER
      },
      provone_hadentity: {
        type: Sequelize.INTEGER
      }
    }).then(() => queryInterface.addConstraint(prov.Classes.GENERATION.toLowerCase(), ['generation_id', 'workflow_identifier'], {
      type: 'primary key',
      name: 'Generation_pkey'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(prov.Classes.GENERATION.toLowerCase());
  }
};