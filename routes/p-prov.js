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
	CustomError = require('../infra/CustomError'),
	ValidationError = require('../infra/ValidationError');

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

router.post('/get-p-prov', function (req, res, next) {
	res.send({
		success: true,
		message: 'User created'
	});
});

module.exports = router;