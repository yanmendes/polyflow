import express from 'express'
import { resolveContext, contexts } from '../query-parsers'
const router = express.Router()

router.post('/', async (req, res, next) => {
  try {
    let { context, query } = resolveContext(req.body.query)

    // Nested queries in bigdawg
    if (typeof query === 'object') { throw new Error("Can't handle that yet") }

    let { parser, dbInterface } = contexts[context]

    query = await parser(query)
    console.log(query)
    await dbInterface(query, results => {
      res.send({
        success: true,
        results: results
      })
    })
  } catch (e) {
    console.log(e)
    res.send(e).status(500)
  }
})

export default router
