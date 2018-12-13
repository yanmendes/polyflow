'use strict';

let prov = require('../models/Prov');
let provone = require('../models/Provone');
let sprintf = require('sprintf-js').sprintf;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(sprintf("ALTER TABLE %s ADD FOREIGN KEY (%s, workflow_identifier) " +
      "REFERENCES %s (collection_id, workflow_identifier) ON UPDATE RESTRICT ON DELETE CASCADE;",
      prov.Classes.ENTITY, prov.Relationships.HADMEMBER, prov.Classes.COLLECTION)
    ).then(() => queryInterface.sequelize.query(sprintf("ALTER TABLE %s ADD FOREIGN KEY (%s, workflow_identifier) " +
      "REFERENCES %s (execution_id, workflow_identifier) ON UPDATE RESTRICT ON DELETE CASCADE;",
      prov.Classes.ENTITY, prov.Relationships.USED, provone.Classes.EXECUTION)
    )).then(() => queryInterface.sequelize.query(sprintf("ALTER TABLE %s ADD FOREIGN KEY (%s, workflow_identifier) " +
      "REFERENCES %s (execution_id, workflow_identifier) ON UPDATE RESTRICT ON DELETE CASCADE;",
      prov.Classes.ENTITY, prov.Relationships.WASGENERATEDBY, provone.Classes.EXECUTION)
    ));
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
