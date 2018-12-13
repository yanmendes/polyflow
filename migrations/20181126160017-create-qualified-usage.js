'use strict';

var prov = require('../models/Prov');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(prov.Relationships.QUALIFIEDUSAGE.toLowerCase(), {
      usage_id: {
        type: Sequelize.INTEGER
      },
      execution_id: {
        type: Sequelize.INTEGER
      },
      workflow_identifier: {
        type: Sequelize.STRING
      }
    }).then(() => queryInterface.addConstraint(prov.Relationships.QUALIFIEDUSAGE.toLowerCase(), ['usage_id', 'execution_id', 'workflow_identifier'], {
      type: 'primary key',
      name: 'QualifiedUsage_pkey'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(prov.Relationships.QUALIFIEDUSAGE.toLowerCase());
  }
};