'use strict';

var prov = require('../Prov');


module.exports = function (sequelize, DataTypes) {
	var prov_qualifiedUsage = sequelize.define(prov.Relationships.QUALIFIEDUSAGE, {}, {});

	return prov_qualifiedUsage;
};