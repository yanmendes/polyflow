const
  express = require('express'),
  router = express.Router(),
  { resolveContext, contexts } = require('../query-parsers');

router.post('/', async (req, res, next) => {
  try {
    let { context, query } = resolveContext(req.body.query)

    //Nested queries in bigdawg
    if (typeof query === 'object')
      throw new error("Can't handle that yet")

    let { parser, dbInterface } = contexts[context]

    query = await parser(query)
    console.log(query)
    results = await dbInterface(query, results => {
      res.send({
        success: true,
        results: results
      })
    })

  } catch (e) {
    next(req, res, next, e)
  }
});

module.exports = router;
