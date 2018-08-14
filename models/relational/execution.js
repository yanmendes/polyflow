'use strict';

var provone = require('../Provone');
var prov = require('../Prov');


module.exports = function (sequelize, DataTypes) {
	var provone_Execution = sequelize.define(provone.Classes.EXECUTION, {
		execution_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		prov_startedAtTime: {
			type: DataTypes.STRING
		},
		prov_endedAtTime: {
			type: DataTypes.STRING
		},
		label: {
			type: DataTypes.STRING
		}
	}, {});

	provone_Execution.associate = function (models) {
		provone_Execution.hasMany(models.provone_Execution, {
			foreignKey: provone.Relationships.WASPARTOF,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});

		provone_Execution.hasMany(models.provone_Execution, {
			foreignKey: prov.Relationships.WASINFORMEDBY,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});

		provone_Execution.hasMany(models.prov_Entity, {
			foreignKey: prov.Relationships.USED,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});

		provone_Execution.hasMany(models.prov_Entity, {
			foreignKey: prov.Relationships.WASGENERATEDBY,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});

		provone_Execution.belongsToMany(models.prov_Association, {
			through: {
				model: models.prov_qualifiedAssociation
			},
			foreignKey: 'execution_id'
		});

		provone_Execution.belongsToMany(models.prov_Generation, {
			through: {
				model: models.prov_qualifiedGeneration
			},
			foreignKey: 'execution_id'
		});

		provone_Execution.belongsToMany(models.prov_Usage, {
			through: {
				model: models.prov_qualifiedUsage
			},
			foreignKey: 'execution_id'
		});
	};

	return provone_Execution;
};