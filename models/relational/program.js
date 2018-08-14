'use strict';

var prov = require('../Prov');
var provone = require('../ProvONE');


module.exports = function (sequelize, DataTypes) {
	let provone_Program = sequelize.define(provone.Classes.PROGRAM, {
		program_id: {
			type: DataTypes.INTEGER,
			primaryKey: true
		},
		label: {
			type: DataTypes.STRING
		},
		is_provone_Workflow: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	}, {});

	provone_Program.associate = function (models) {
		provone_Program.hasMany(models.provone_Port, {
			foreignKey: provone.Relationships.HASINPORT,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});

		provone_Program.hasMany(models.provone_Port, {
			foreignKey: provone.Relationships.HASOUTPORT,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});

		provone_Program.hasMany(models.provone_Program, {
			foreignKey: provone.Relationships.HASSUBPROGRAM,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});

		provone_Program.hasMany(models.provone_Program, {
			foreignKey: prov.Relationships.WASDERIVEDFROM,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});

		provone_Program.hasMany(models.prov_Association, {
			foreignKey: prov.Relationships.HADPLAN,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});
	};

	return provone_Program;
};