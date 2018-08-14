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
 * @api {get} /r-prov/ Creates a user
 * @apiName PostUser
 * @apiGroup User
 * @apiParam {String} name The name of the user
 * @apiParam {String} email The mail of the user
 * @apiParam {String} password The password of the user
 * @apiParamExample {Object} Request example:
 * {
 *   name: 'My name',
 *   email: 'myemail@mydomain.com',
 *   password: '123456'
 * }
 * @apiUse DefaultHeader
 * @apiUse DefaultSuccess
 * @apiUse DefaultSuccessExample
 * @apiUse ValidationError
 * @apiUse CurrentVersion
 */

router.get('/:graph/:workflow', function (req, res, next) {
	res.send({
		success: true,
		message: 'User created'
	});
});

module.exports = router;