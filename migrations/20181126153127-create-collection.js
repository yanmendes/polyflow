'use strict';

var prov = require('../models/Prov');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(prov.Classes.COLLECTION.toLowerCase(), {
      collection_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
      },
      label: {
        type: Sequelize.STRING
      },
      workflow_identifier: {
        type: Sequelize.STRING
      }
    }).then(() => queryInterface.addConstraint(prov.Classes.COLLECTION.toLowerCase(), ['collection_id', 'workflow_identifier'], {
      type: 'primary key',
      name: 'Collection_pkey'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(prov.Classes.COLLECTION.toLowerCase());
  }
};