'use strict';

var prov = require('../models/Prov');
var provone = require('../models/ProvONE');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(provone.Classes.USER.toLowerCase(), {
      user_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      label: {
        type: Sequelize.STRING
      },
      workflow_identifier: {
        type: Sequelize.STRING
      }
    }).then(() => queryInterface.addConstraint(provone.Classes.USER.toLowerCase(), ['user_id', 'workflow_identifier'], {
      type: 'primary key',
      name: 'User_pkey'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(provone.Classes.USER.toLowerCase());
  }
};