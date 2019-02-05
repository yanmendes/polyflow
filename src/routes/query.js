import express from 'express'
import { contextualizeSubQueries, getParserAndInterface } from '../query-parsers'
import Pino from 'pino'

const logger = Pino()
const router = express.Router()

router.post('/', async (req, res, next) => {
  try {
    const contextualizedQueries = contextualizeSubQueries(req.body.query)

    if (contextualizedQueries.length > 1) {
      throw new Error(`Can't support multiple queries yet`)
    }

    for (const contextualizedQuery of contextualizedQueries) {
      const { context, query } = contextualizedQuery
      const { parser, dbInterface } = getParserAndInterface(context)

      const parsedQuery = await parser(query)
      logger.info(parsedQuery)
      await dbInterface(parsedQuery, results => {
        res.send({
          success: true,
          results: results
        })
      })
    }
  } catch (e) {
    logger.error(e)
    res.send(e).status(500)
  }
})

export default router
