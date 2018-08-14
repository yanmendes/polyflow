'use strict';

var prov = require('../Prov');
var provone = require('../ProvONE');


module.exports = function (sequelize, DataTypes) {
	var prov_Usage = sequelize.define(prov.Classes.USAGE, {
		usage_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		label: {
			type: DataTypes.STRING
		}
	}, {});

	prov_Usage.associate = function (models) {
		prov_Usage.belongsToMany(models.provone_Execution, {
			through: {
				model: models.prov_qualifiedUsage
			},
			foreignKey: 'usage_id'
		});
	};

	return prov_Usage;
};