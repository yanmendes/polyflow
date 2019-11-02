import { In } from 'typeorm'

import { getUsedMediators } from './databases/query-resolvers'
import { getResolverAndInterface } from './databases'
import { measure } from '../performance'
import logger, { categories } from '../logger'
import { Mediator } from '../models/polyflow'
import { UserInputError } from 'apollo-server-core'

export const runQuery = async query => {
  const log = logger.child({
    category: categories.DATABASE_INTERFACE
  })

  const usedMediators = getUsedMediators(query)

  const mediators = await Mediator.find({
    relations: ['dataSource', 'entities'],
    where: { slug: In(usedMediators) }
  })

  if (mediators.length === 0) {
    throw new Error(`No valid mediators found in issued query`)
  }

  const { uri, type } = mediators[0].dataSource
  const hasDifferentDataSources = () =>
    !!mediators.filter(({ dataSource }) => dataSource.uri !== uri).length

  if (hasDifferentDataSources()) {
    throw new Error(
      `Invalid query, it uses mediators with different data sources`
    )
  }

  const { resolver, dbInterface } = getResolverAndInterface(type)

  const entities = mediators
    .map(({ slug: mediatorSlug, entities }) =>
      entities.map(e => ({
        ...e,
        mediatorSlug
      }))
    )
    .flat()

  try {
    const parsedQuery = (await resolver(query, entities)).replace(/\s+/g, ' ')
    return measure(
      log.child({ query: parsedQuery }),
      `Issuing parsed query to ${type}`,
      () => dbInterface.query(uri, parsedQuery)
    )
  } catch (error) {
    log
      .child({
        query,
        error: error.stack
      })
      .error('Couldn`t resolve the query')

    if (error instanceof UserInputError) {
      throw error
    }
    throw new UserInputError(
      `Couldn't resolve the query. It's either an invalid SQL statement or wrong Polyflow syntax.
       Check the docs https://github.com/yanmendes/polyflow`
    )
  }
}
