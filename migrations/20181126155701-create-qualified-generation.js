'use strict';

var prov = require('../models/Prov');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(prov.Relationships.QUALIFIEDGENERATION.toLowerCase(), {
      generation_id: {
        type: Sequelize.INTEGER
      },
      execution_id: {
        type: Sequelize.INTEGER
      },
      workflow_identifier: {
        type: Sequelize.STRING
      }
    }).then(() => queryInterface.addConstraint(prov.Relationships.QUALIFIEDGENERATION.toLowerCase(), ['generation_id', 'execution_id', 'workflow_identifier'], {
      type: 'primary key',
      name: 'QualifiedGeneration_pkey'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(prov.Relationships.QUALIFIEDGENERATION.toLowerCase());
  }
};