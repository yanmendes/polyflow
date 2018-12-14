let
  express = require('express'),
  router = express.Router(),
  _ = require('lodash'),
  db = require('../models/index').sequelize,
  prov = require('../models/Prov'),
  provone = require('../models/Provone'),
  neo4j = require('../infra/Neo4jConnector');

let psqlInterface = function (query) {
  return new Promise((resolve, reject) => {
    if(query)
      db.query(query, { type: db.QueryTypes.SELECT}).then((result, error) => {
        if (error)
          reject(error);

        resolve(result);
      });
    else
      resolve('No query issued to this interface');
  });
};

let neo4jInterface = function(query) {
  return new Promise((resolve, reject) => {
    if(query)
      neo4j.run(query).then((result) => {
        resolve(result.records)
      });
    else
      resolve('No query issued to this interface');
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
  psqlInterface(
  `SELECT * FROM ${provone.Classes.EXECUTION} exe ` +
  `LEFT JOIN ${prov.Classes.ENTITY} use ON exe.execution_id = use.prov_used ` +
  `LEFT JOIN ${prov.Classes.ENTITY} gen ON exe.execution_id = gen.prov_wasgeneratedby `
  ).then((results) => {
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
  psqlInterface(
    `SELECT * FROM ${provone.Classes.PROGRAM} p ` +
    `LEFT JOIN ${provone.Classes.PORT} inport ON p.program_id = inport.provone_hasinport AND p.workflow_identifier = inport.workflow_identifier ` +
    `LEFT JOIN ${provone.Classes.PORT} outport ON p.program_id = outport.provone_hasoutport AND p.workflow_identifier = outport.workflow_identifier `
  ).then((results) => {
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