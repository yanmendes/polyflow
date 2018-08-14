'use strict';

var prov = require('../Prov');


module.exports = function (sequelize, DataTypes) {
	var prov_qualifiedAssociation = sequelize.define(prov.Relationships.QUALIFIEDASSOCIATION, {
		association_id: {
			type: DataTypes.INTEGER
		}
	}, {});

	return prov_qualifiedAssociation;
};