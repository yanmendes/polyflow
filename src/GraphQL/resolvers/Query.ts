import { verify, decode } from 'jsonwebtoken'

import { runQuery } from '../../core'
import { measure } from '../../performance'
import logger, { categories } from '../../logger'
import { DataSource, Entity, Mediator } from '../../models'
import Context from '../../types/context.spec'
import { JWT_SECRET } from '../../config'

const log = logger.child({
  category: categories.POLYFLOW_CORE
})

const getToken = req => req.cookies['auth-cookie']

export default {
  query: (_, { query }) =>
    measure(log, 'Transforming and running issued query', () =>
      runQuery(query).catch(e => {
        log.child({
          error: e.stack || e,
          message: `Something went wrong while processing your query: ${e}`
        })

        throw e
      })
    ),

  dataSources: () => DataSource.find({ relations: ['mediators'] }),

  mediators: () => Mediator.find({ relations: ['dataSource', 'entities'] }),

  entities: () => Entity.find({ relations: ['mediator'] }),

  me: (_, __, { req }: Context) =>
    Promise.resolve(getToken(req))
      .then(token => verify(token, JWT_SECRET))
      .then(ok =>
        ok
          ? decode(getToken(req))
          : Promise.reject(new Error('Invalid token. Please log in again.'))
      )
}
