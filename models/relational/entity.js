'use strict';

var prov = require('../Prov');
var provone = require('../ProvONE');


module.exports = function (sequelize, DataTypes) {
	var prov_Entity = sequelize.define(prov.Classes.ENTITY, {
		entity_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		label: {
			type: DataTypes.STRING
		},
		type: {
			type: DataTypes.STRING
		},
		value: {
			type: DataTypes.STRING
		},
		entity_type: {
			type: DataTypes.ENUM(provone.Classes.DATA, provone.Classes.DOCUMENT, provone.Classes.VISUALIZATION)
		}
	}, {});

	prov_Entity.associate = function (models) {
		prov_Entity.hasMany(models.prov_Generation, {
			foreignKey: provone.Relationships.HADENTITY,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});

		prov_Entity.hasMany(models.prov_Usage, {
			foreignKey: provone.Relationships.HADENTITY,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});
	};

	return prov_Entity;
};