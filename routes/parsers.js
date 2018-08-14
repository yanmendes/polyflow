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
	Kepler = require('../parsers/Kepler'),
	Taverna = require('../parsers/Taverna');

router.post('/kepler', function (req, res, next) {
	const kepler = new Kepler();
	kepler.execute().then(() => {
		res.send({
			success: true,
			message: "Kepler workflow imported correctly"
		});
	}).catch((err) => {
		return next(err, req, res);
	});
});

//TODO: FILE UPLOAD

router.post('/taverna', function (req, res, next) {
	const taverna = new Taverna();
	taverna.execute('file:///tmp/workflowrun.prov.ttl').then(() => {
		res.send({
			success: true,
			message: "Taverna file parsed correctly"
		});
	}).catch((err) => {
		return next(err, req, res);
	});
});

module.exports = router;