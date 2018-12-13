'use strict';

let sprintf = require('sprintf-js').sprintf;
let prov = require('../models/Prov');
let provone = require('../models/Provone');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      sprintf('ALTER TABLE %s ADD FOREIGN KEY (generation_id, workflow_identifier) REFERENCES %s (generation_id, workflow_identifier);',
        prov.Relationships.QUALIFIEDGENERATION, prov.Classes.GENERATION)
    ).then(() => queryInterface.sequelize.query(
      sprintf('ALTER TABLE %s ADD FOREIGN KEY (execution_id, workflow_identifier) REFERENCES %s (execution_id, workflow_identifier);',
        prov.Relationships.QUALIFIEDGENERATION, provone.Classes.EXECUTION)));
  },

  down: (queryInterface, Sequelize) => {
    /*
     Add reverting commands here.
     Return a promise to correctly handle asynchronicity.

     Example:
     return queryInterface.dropTable('users');
     */
  }
};
