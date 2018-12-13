'use strict';

let prov = require('../models/Prov');
let provone = require('../models/ProvONE');
let sprintf = require('sprintf-js').sprintf;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(sprintf("ALTER TABLE %s ADD FOREIGN KEY (%s, workflow_identifier) " +
      "REFERENCES %s (user_id, workflow_identifier) ON UPDATE RESTRICT ON DELETE CASCADE;",
      provone.Classes.EXECUTION, prov.Relationships.WASASSOCIATEDWITH, provone.Classes.USER));
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
