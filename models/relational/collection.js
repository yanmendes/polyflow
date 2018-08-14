'use strict';

var prov = require('../Prov');
var provone = require('../ProvONE');


module.exports = function (sequelize, DataTypes) {
	var prov_Collection = sequelize.define(prov.Classes.ENTITY, {
		collection_id: {
			type: DataTypes.INTEGER,
			primaryKey: true
		},
		label: {
			type: DataTypes.STRING
		}
	}, {});

	prov_Collection.associate = function (models) {
		prov_Collection.hasMany(models.provone_Entity, {
			foreignKey: prov.Relationships.HADMEMBER,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});
	};

	return prov_Collection;
};