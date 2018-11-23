let
	express = require('express'),
	router = express.Router(),
	_ = require('lodash'),
	neo4j = require('../infra/Neo4jConnector');

router.get('/diameter', function (req, res, next) {
	neo4j.run('MATCH p=(:provone_Program)-[:provone_hasSubProgram]-(:provone_Program) RETURN p, length(p) AS L ORDER BY L DESC')
		.then((results) => {
			res.send({
				success: true,
				message: 'Got data',
				neo4jResults: results.records
			});
		}).catch((err) => {
		next(err, req, res);
	});
});

router.get('/pagerank', function (req, res, next) {
	neo4j.run("CALL algo.pageRank.stream('provone_Execution', 'provone_wasPartOf', {iterations:20, dampingFactor:0.85})\n" +
		"YIELD nodeId, score\n" +
		"\n" +
		"MATCH (node) WHERE id(node) = nodeId\n" +
		"\n" +
		"RETURN node.id AS execution_id,score\n" +
		"ORDER BY score DESC")
		.then((results) => {
			res.send({
				success: true,
				message: 'Got data',
				neo4jResults: results.records
			});
		}).catch((err) => {
		next(err, req, res);
	});
});

module.exports = router;