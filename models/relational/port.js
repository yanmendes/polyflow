'use strict';

let provone = require('../Provone');

module.exports = function (sequelize, DataTypes) {
	let provone_Port = sequelize.define(provone.Classes.PORT, {
		port_id: {
			type: DataTypes.INTEGER,
			primaryKey: true
		},
		label: {
			type: DataTypes.STRING
		},
		port_type: {
			type: DataTypes.ENUM('in', 'out')
		}
	}, {});

	provone_Port.associate = function (models) {
		provone_Port.hasMany(models.prov_Usage, {
			foreignKey: provone.Relationships.HADINPORT,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});

		provone_Port.hasMany(models.prov_Generation, {
			foreignKey: provone.Relationships.HADOUTPORT,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});

		provone_Port.hasOne(models.prov_Entity, {
			foreignKey: provone.Relationships.HASDEFAULTPARAM,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});

		provone_Port.belongsTo(models.provone_Program, {
			foreignKey: provone.Relationships.HASOUTPORT,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});

		provone_Port.belongsTo(models.provone_Program, {
			foreignKey: provone.Relationships.HASINPORT,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});
	};

	return provone_Port;
};