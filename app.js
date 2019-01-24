'use strict';
let express = require('express'),
  cors = require('cors'),
  logger = require('morgan'),
  _ = require('lodash'),
  bodyParser = require('body-parser'),
  query = require('./routes/query'),
  user = require('./routes/user'),
  expressValidator = require('express-validator'),
  ValidationErrors = require('./infra/ValidationError');

let app = express();

//Serving statically
app.use(express.static('public'));

//Allow cors
app.use(cors());

//Form handlers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator({}));

//Logger
app.use(logger('dev'));

// app.use(jwt({secret: config.jwt.secret}).unless({path: ['/user/authenticate', '/user/create']}));

//Mapping routes
app.use('/query', query);
app.use('/', user);

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
    res.send({ success: false, status: err.status, message: err.message, data: err.data });
  } else if (app.get('env') === 'development') {
    res.send({ success: false, status: err.status, message: err.message, error: err });
  } else {
    res.send({ success: false, status: err.status, message: err.message });
  }
});

module.exports = app;
