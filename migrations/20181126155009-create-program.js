'use strict';

let prov = require('../models/Prov');
let provone = require('../models/ProvONE');
let sprintf = require('sprintf-js').sprintf;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(provone.Classes.PROGRAM.toLowerCase(), {
      program_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      label: {
        type: Sequelize.STRING
      },
      workflow_identifier: {
        type: Sequelize.STRING
      },
      is_provone_workflow: {
        type: Sequelize.BOOLEAN
      },
      provone_hassubprogram: {
        type: Sequelize.INTEGER
      },
      prov_wasderivedfrom: {
        type: Sequelize.INTEGER
      }
    }).then(() => queryInterface.addConstraint(provone.Classes.PROGRAM.toLowerCase(), ['program_id', 'workflow_identifier'], {
      type: 'primary key',
      name: 'Program_pkey'
    })).then(() => queryInterface.sequelize.query(sprintf('ALTER TABLE %s ADD FOREIGN KEY (%s, workflow_identifier) REFERENCES %s (program_id, workflow_identifier);',
      provone.Classes.PROGRAM, provone.Relationships.HASSUBPROGRAM, provone.Classes.PROGRAM)
    )).then(() => queryInterface.sequelize.query(sprintf('ALTER TABLE %s ADD FOREIGN KEY (%s, workflow_identifier) REFERENCES %s (program_id, workflow_identifier);',
      provone.Classes.PROGRAM, prov.Relationships.WASDERIVEDFROM, provone.Classes.PROGRAM)));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(provone.Classes.PROGRAM.toLowerCase());
  }
};