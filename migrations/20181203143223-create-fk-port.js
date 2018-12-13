'use strict';

let sprintf = require('sprintf-js').sprintf;
let prov = require('../models/Prov');
let provone = require('../models/Provone');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      sprintf('ALTER TABLE %s ADD FOREIGN KEY (%s, workflow_identifier) REFERENCES %s (program_id, workflow_identifier);',
        provone.Classes.PORT, provone.Relationships.HASINPORT, provone.Classes.PROGRAM)
    ).then(() => queryInterface.sequelize.query(
      sprintf('ALTER TABLE %s ADD FOREIGN KEY (%s, workflow_identifier) REFERENCES %s (program_id, workflow_identifier);',
        provone.Classes.PORT, provone.Relationships.HASOUTPORT, provone.Classes.PROGRAM)
    )).then(() => queryInterface.sequelize.query(
      sprintf('ALTER TABLE %s ADD FOREIGN KEY (%s, workflow_identifier) REFERENCES %s (entity_id, workflow_identifier);',
        provone.Classes.PORT, provone.Relationships.HASDEFAULTPARAM, prov.Classes.ENTITY)
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
