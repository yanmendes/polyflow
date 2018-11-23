let
	express = require('express'),
	router = express.Router(),
	formidable = require('formidable'),
	uploadDir = __dirname + '/../',
	fs = require('fs'),
	Kepler = require('../wrappers/Kepler'),
	CustomError = require('../infra/CustomError'),
	Taverna = require('../wrappers/Taverna');

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