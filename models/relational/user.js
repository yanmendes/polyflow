'use strict';

var provone = require('../Provone');
var prov = require('../Prov');


module.exports = function (sequelize, DataTypes) {
	var provone_User = sequelize.define(provone.Classes.USER, {
		user_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		label: {
			type: DataTypes.STRING
		}
	}, {});

	provone_User.associate = function (models) {
		provone_User.hasMany(models.provone_Execution, {
			foreignKey: prov.Relationships.WASASSOCIATEDWITH,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});

		provone_User.hasMany(models.prov_Association, {
			foreignKey: prov.Relationships.AGENT,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});
	};

	return provone_User;
};