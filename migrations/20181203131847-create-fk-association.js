'use strict';

let prov = require('../models/Prov');
let provone = require('../models/Provone');
let sprintf = require('sprintf-js').sprintf;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(sprintf("ALTER TABLE %s ADD FOREIGN KEY (%s, workflow_identifier) " +
      "REFERENCES %s (program_id, workflow_identifier) ON UPDATE RESTRICT ON DELETE CASCADE;",
      prov.Classes.ASSOCIATION, prov.Relationships.HADPLAN, provone.Classes.PROGRAM)
    ).then(() => queryInterface.sequelize.query(sprintf("ALTER TABLE %s ADD FOREIGN KEY (%s, workflow_identifier) " +
      "REFERENCES %s (user_id, workflow_identifier) ON UPDATE RESTRICT ON DELETE CASCADE;",
      prov.Classes.ASSOCIATION, prov.Relationships.AGENT, provone.Classes.USER)));
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
