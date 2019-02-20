import * as express from 'express'
import { contextualizeSubQueries, getParserAndInterface } from '../query-parsers'
import { LoggedRequest } from '../types/request'

const router = express.Router()

router.post('/', async (req: LoggedRequest, res) => {
  try {
    if (!req.body.query || !req.body.query.trim()) {
      throw new Error(`You need a parameter query to consume this endpoint`)
    }

    const contextualizedQueries = contextualizeSubQueries(req.body.query)

    if (contextualizedQueries.length > 1) {
      throw new Error(`Can't support multiple queries yet`)
    } else if (contextualizedQueries.length === 0) {
      throw new Error(`${req.body.query} is not a valid query`)
    }

    for (const contextualizedQuery of contextualizedQueries) {
      const { context, query } = contextualizedQuery
      const { parser, dbInterface } = getParserAndInterface(context)

      const parsedQuery = await parser(query)

      req.log.info(parsedQuery)
      const results = await dbInterface(parsedQuery)
      res.send({
        success: true,
        results: results
      })
    }
  } catch (e) {
    const child = req.log.child({ aditionalInfo: e.mediationInfo, stack: e.stack })
    child.error(e.message)

    res.status(500)
    res.send({
      success: false,
      message: e.message
    })
  }
})

export default router
