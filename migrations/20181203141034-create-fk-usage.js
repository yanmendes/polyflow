'use strict';

let sprintf = require('sprintf-js').sprintf;
let prov = require('../models/Prov');
let provone = require('../models/Provone');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      sprintf('ALTER TABLE %s ADD FOREIGN KEY (%s, workflow_identifier) REFERENCES %s (entity_id, workflow_identifier);',
        prov.Classes.USAGE, provone.Relationships.HADENTITY, prov.Classes.ENTITY)
    ).then(() => queryInterface.sequelize.query(
      sprintf('ALTER TABLE %s ADD FOREIGN KEY (%s, workflow_identifier) REFERENCES %s (port_id, workflow_identifier);',
        prov.Classes.USAGE, provone.Relationships.HADINPORT, provone.Classes.PORT)
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
