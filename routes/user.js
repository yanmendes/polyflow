const
  express = require('express'),
  router = express.Router(),
  { resolveContext, contexts } = require('../query-parsers');

router.post('/authenticate', async (req, res, next) => {
  res.send({
      success: true
  })
});

module.exports = router;
