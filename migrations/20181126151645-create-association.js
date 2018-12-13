'use strict';

let prov = require('../models/Prov');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(prov.Classes.ASSOCIATION.toLowerCase(), {
      association_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      label: {
        type: Sequelize.STRING
      },
      workflow_identifier: {
        type: Sequelize.STRING
      },
      prov_hadplan: {
        type: Sequelize.INTEGER
      },
      prov_agent: {
        type: Sequelize.INTEGER
      }
    }).then(() => queryInterface.addConstraint(prov.Classes.ASSOCIATION.toLowerCase(), ['association_id', 'workflow_identifier'], {
        type: 'primary key',
        name: 'Associations_pkey'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(prov.Classes.ASSOCIATION.toLowerCase());
  }
};