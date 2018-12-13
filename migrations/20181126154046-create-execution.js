'use strict';

let prov = require('../models/Prov');
let provone = require('../models/ProvONE');
let sprintf = require('sprintf-js').sprintf;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(provone.Classes.EXECUTION.toLowerCase(), {
      execution_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      label: {
        type: Sequelize.STRING
      },
      workflow_identifier: {
        type: Sequelize.STRING
      },
      prov_startedattime: {
        type: Sequelize.STRING
      },
      prov_endedattime: {
        type: Sequelize.STRING
      },
      provone_waspartof: {
        type: Sequelize.INTEGER
      },
      prov_wasinformedby: {
        type: Sequelize.INTEGER
      },
      prov_wasassociatedwith: {
        type: Sequelize.INTEGER
      }
    }).then(() => queryInterface.addConstraint(provone.Classes.EXECUTION.toLowerCase(), ['execution_id', 'workflow_identifier'], {
      type: 'primary key',
      name: 'Execution_pkey'
    })).then(() => queryInterface.sequelize.query(sprintf('ALTER TABLE %s ADD FOREIGN KEY (%s, workflow_identifier) REFERENCES %s (execution_id, workflow_identifier);',
      provone.Classes.EXECUTION, provone.Relationships.WASPARTOF, provone.Classes.EXECUTION)
    )).then(() => queryInterface.sequelize.query(sprintf('ALTER TABLE %s ADD FOREIGN KEY (%s, workflow_identifier) REFERENCES %s (execution_id, workflow_identifier);',
      provone.Classes.EXECUTION, prov.Relationships.WASINFORMEDBY, provone.Classes.EXECUTION)));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(provone.Classes.EXECUTION.toLowerCase());
  }
};