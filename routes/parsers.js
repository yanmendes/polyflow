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
	formidable = require('formidable'),
	uploadDir = __dirname + '/../',
	fs = require('fs'),
	Kepler = require('../parsers/Kepler'),
	CustomError = require('../infra/CustomError'),
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

router.post('/taverna', function (req, res, next) {
	const taverna = new Taverna();
	let form = new formidable.IncomingForm();
	form.uploadDir = uploadDir;
	form.maxFieldsSize = 100 * 1024 * 1024;
	form.multiples = true;

	let workflowIdentifier, filePath;

	form.parse(req, function (err, fields, files) {
		if (err)
			return next(err, req, res);

		if (!files.tavernaFile || !fields.workflowIdentifier || files.tavernaFile.type !== 'text/turtle')
			return next(new CustomError(400, 'No valid files were sent or workflow identifier was not set'), req, res);

		filePath = files.tavernaFile.path;
		workflowIdentifier = fields.workflowIdentifier;
	});

	form.on('end', () => {
		taverna.execute(filePath, workflowIdentifier).then(() => {
			fs.unlinkSync(filePath);
			res.send({
				success: true,
				message: "Taverna file parsed correctly"
			});
		}).catch((err) => {
			return next(err, req, res);
		});
	});
});

module.exports = router;