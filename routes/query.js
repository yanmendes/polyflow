let
  express = require('express'),
  router = express.Router(),
  _ = require('lodash'),
  models = require('../models/index'),
  neo4j = require('../infra/Neo4jConnector');

let psqlInterface = function (query) {
  return new Promise((resolve, reject) => {
    if(query)
      models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT}).then((result, error) => {
        if (error)
          reject(error);

        resolve(result);
      });
    else
      resolve();
  });
};

let neo4jInterface = function(query) {
  return new Promise((resolve, reject) => {
    if(query)
      neo4j.run(query).then((result) => {
        resolve(result.records)
      });
    else
      resolve();
  });
};

router.post('/psql', (req, res, next) => {
  psqlInterface(req.body.query).then((results) => {
    res.send({
      success: true,
      message: 'Successful query',
      results: results
    });
  }).catch((error) => {
    next(error, req, res);
  });
});

router.post('/neo4j', (req, res, next) => {
  neo4jInterface(req.body.query).then((results) => {
    res.send({
      success: true,
      message: 'Successful query',
      results: results
    });
  }).catch((error) => {
    next(error, req, res);
  });
});

router.post('/', (req, res, next) => {
  let psqlResult;

  psqlInterface(req.body.psqlQuery).then((results) => {
    psqlResult = results;

    return neo4jInterface(req.body.neo4jQuery);
  }).then((result) => {
    res.send({
      success: true,
      message: 'Successful query',
      pqslResult: psqlResult,
      neo4jResult: result
    });
  }).catch((error) => {
    next(error, req, res);
  });
});

router.get('/r-prov', (req, res, next) => {
  let psqlResult;
  models.provone_Execution.findAll({
    include: [
      models.prov_Entity
    ]
  }).then((results, err) => {
    if (err)
      throw err;

    psqlResult = results;

    return neo4jInterface('MATCH (n:ProvONE_Execution)-[r]-(m:Prov_Entity) RETURN n, r, m');
  }).then((results) => {
    res.send({
      success: true,
      message: 'Got data',
      psqlResults: psqlResult,
      neo4jResults: results
    });
  }).catch((err) => {
    next(err, req, res);
  });
});

router.get('/p-prov', function (req, res, next) {
  let psqlResult;
  models.provone_Program.findAll({
    include: [
      models.provone_Port
    ]
  }).then((results, err) => {
    if (err)
      throw err;

    psqlResult = results;

    return neo4jInterface('MATCH (n:ProvONE_Program)-[r]-(m:ProvONE_Port) RETURN n, r, m');
  }).then((results) => {
    res.send({
      success: true,
      message: 'Got data',
      psqlResults: psqlResult,
      neo4jResults: results
    });
  }).catch((err) => {
    next(err, req, res);
  });
});

module.exports = router;