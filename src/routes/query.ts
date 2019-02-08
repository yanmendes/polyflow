import express from 'express'
import { contextualizeSubQueries, getParserAndInterface } from '../query-parsers'
import Pino from 'pino'

const logger = Pino()
const router = express.Router()

router.post('/', async (req, res, next) => {
  try {
    if (!req.body.query.trim()) {
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
      logger.info(parsedQuery)
      await dbInterface(parsedQuery, (results: any) => {
        res.send({
          success: true,
          results: results
        })
      })
    }
  } catch (e) {
    const child = logger.child({ aditionalInfo: e.mediationInfo, stack: e.stack })
    child.error(e.message)

    res.send({
      success: false,
      message: e.message
    }).status(500)
  }
})

export default router
