var express = require('express'),
	path = require('path'),
	cors = require('cors'),
	logger = require('morgan'),
	_ = require('lodash'),
	bodyParser = require('body-parser'),
	p_prov = require('./routes/p-prov'),
	r_prov = require('./routes/r-prov'),
	parsers = require('./routes/parsers'),
	models = require('./models/relational'),
	neo4j = require('./infra/Neo4jConnector'),
	expressValidator = require('express-validator'),
	CustomError = require('./infra/CustomError'),
	ValidationErrors = require('./infra/ValidationError');

var app = express();

//Setting view engine
app.set('view engine', 'ejs');

//Serving statically
app.use(express.static('public'));

//Allow cors
app.use(cors());

//Form handlers
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(expressValidator({}));

//Logger
app.use(logger('dev'));

// app.use(jwt({secret: config.jwt.secret}).unless({path: ['/user/authenticate', '/user/create']}));

//Mapping routes
app.use('/p-prov', p_prov);
app.use('/r-prov', r_prov);
app.use('/parsers', parsers);
app.use('/query', (req, res, next) => {
	let psqlResult;

	models.sequelize.query(req.body.psqlQuery, (result, error) => {
		if (error)
			throw new error;

		return result;
	}).then((result) => {
		psqlResult = result;

		return neo4j.run(req.body.neo4jQuery);
	}).then((result) => {
		res.send({
			success: true,
			message: 'Success query',
			pqslResult: psqlResult,
			neo4jResult: result.records
		});
	}).catch((error) => {
		next(error, req, res);
	});
});

// Error handlers
// Catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Catch 500 and forward to error handler
app.use(function (err, req, res, next) {
	res.status(err.status || 500);

	if (err instanceof ValidationErrors) {
		res.send({success: false, status: err.status, message: err.message, data: err.data});
	} else if (app.get('env') === 'development') {
		res.send({success: false, status: err.status, message: err.message, error: err});
	} else {
		res.send({success: false, status: err.status, message: err.message});
	}
});

module.exports = app;
