'use strict';

var prov = require('../Prov');
var provone = require('../ProvONE');


module.exports = function (sequelize, DataTypes) {
	var prov_Generation = sequelize.define(prov.Classes.GENERATION, {
		generation_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		label: {
			type: DataTypes.STRING
		}
	}, {});

	prov_Generation.associate = function (models) {
		prov_Generation.belongsToMany(models.provone_Execution, {
			through: {
				model: models.prov_qualifiedGeneration
			},
			foreignKey: 'generation_id'
		});
	};

	return prov_Generation;
};