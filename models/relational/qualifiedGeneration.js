'use strict';

var prov = require('../Prov');

module.exports = function (sequelize, DataTypes) {
	var prov_qualifiedGeneration = sequelize.define(prov.Relationships.QUALIFIEDGENERATION, {}, {});

	return prov_qualifiedGeneration;
};