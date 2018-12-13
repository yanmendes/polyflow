'use strict';

let prov = require('../models/Prov');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(prov.Relationships.QUALIFIEDASSOCIATION.toLowerCase(), {
      association_id: {
        type: Sequelize.INTEGER
      },
      execution_id: {
        type: Sequelize.INTEGER
      },
      workflow_identifier: {
        type: Sequelize.STRING
      }
    }).then(() => queryInterface.addConstraint(prov.Relationships.QUALIFIEDASSOCIATION.toLowerCase(), ['association_id', 'execution_id', 'workflow_identifier'], {
      type: 'primary key',
      name: 'QualifiedAssociation_pkey'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(prov.Relationships.QUALIFIEDASSOCIATION.toLowerCase());
  }
};