'use strict';

var prov = require('../Prov');

module.exports = function (sequelize, DataTypes) {
	var prov_Association = sequelize.define(prov.Classes.ASSOCIATION, {
		association_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		label: {
			type: DataTypes.STRING
		}
	}, {});

	prov_Association.associate = function (models) {
		prov_Association.belongsToMany(models.provone_Execution, {
			through: {
				model: models.prov_qualifiedAssociation
			},
			foreignKey: 'association_id'
		});

		prov_Association.belongsTo(models.provone_Program, {
			foreignKey: prov.Relationships.HADPLAN,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});
	};

	return prov_Association;
};