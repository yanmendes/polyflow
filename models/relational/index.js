'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(module.filename);
var db = {};

if(process.env === 'production')
	require('dotenv').config({path: './envs/.prod'});
else
	require('dotenv').config({path: './envs/.dev'});

var sequelize = new Sequelize(process.env.WSDATABASE, process.env.WSUSER, process.env.WSPASSWORD, {
	host: process.env.WSHOST,
	port: process.env.WSPORT,
	dialect: 'postgres'
});

fs
	.readdirSync(__dirname)
	.filter(function (file) {
		return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
	})
	.forEach(function (file) {
		var model = sequelize['import'](path.join(__dirname, file));
		db[model.name] = model;
	});

Object.keys(db).forEach(function (modelName) {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});


db.sequelize = sequelize;

module.exports = db;
