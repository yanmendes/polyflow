let
	express = require('express'),
	router = express.Router(),
	_ = require('lodash'),
	models = require('../models/relational'),
	neo4j = require('../infra/Neo4jConnector');

router.get('/', function (req, res, next) {
	let psqlResult;
	models.provone_Program.findAll({
		include: [
			models.provone_Port
		]
	}).then((results, err) => {
		if (err)
			throw err;

		psqlResult = results;

		return neo4j.run('MATCH (n:ProvONE_Program)-[r]-(m:ProvONE_Port) RETURN n, r, m');
	}).then((results) => {
		res.send({
			success: true,
			message: 'Got data',
			psqlResults: psqlResult,
			neo4jResults: results.records
		});
	}).catch((err) => {
		next(err, req, res);
	});
});

module.exports = router;