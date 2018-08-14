/**
 * @apiDefine CurrentVersion
 * @apiVersion 0.0.0
 */

/**
 * @apiDefine DefaultHeader
 * @apiHeader (Authorization) {string} Authorization The authorization token
 * @apiHeaderExample {Object} Request example:
 * {
 *    Authorization : 'Bearer XPTO'
 * }
 */

/**
 * @apiDefine DefaultSuccess
 * @apiSuccess {boolean} success If the request was successful or not
 * @apiSuccess {string} message The output message.
 */

/**
 * @apiDefine DefaultSuccessExample
 * @apiSuccessExample Example data on success:
 * {
 *    success: true,
 *    message: 'Data retrieved successfully'
 * }
 */

/**
 * @apiDefine ValidationError
 * @apiError (400) {String} ValidationError <code>Field</code> not set
 */

/**
 * @apiDefine NotFoundError
 * @apiError (404) {String} NotFoundError Object <code>id</code> not found
 */

var
	express = require('express'),
	router = express.Router(),
	_ = require('lodash'),
	models = require('../models/relational'),
	neo4j = require('../infra/Neo4jConnector');

/**
 * @api {post} /p-prov/ Gets prospective provenance for a workflow and a graph
 * @apiName GetP-Prov
 * @apiGroup User
 * @apiParam {Integer} workflow The workflow
 * @apiParam {Integer} graph The provenance graph
 * @apiParamExample {Object} Request example:
 * {
 *   workflow: 1,
 *   graph: 1
 * }
 * @apiUse DefaultHeader
 * @apiSuccess {boolean} success If the request was successful or not
 * @apiSuccess {Object} workflow The programs and their input and output ports.
 * @apiUse ValidationError
 * @apiUse CurrentVersion
 */

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