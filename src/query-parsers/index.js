import sqlParser from '../query-parsers/sql'
import psqlInterface from '../../infra/PsqlInterface'

export const resolveContext = (query) => {
  const regex = /^(bd\w+)\((.*)\)$/gmi
  const result = regex.exec(query)
  if (!result) { throw new Error(`Invalid query statement: ${query}`) }

  let context = result[1]
  query = result[2]

  if (query.startsWith('bd')) {
    return {
      context, query: resolveContext(query)
    }
  }

  return { context, query }
}

export const contexts = {
  bdrel: {
    parser: sqlParser,
    dbInterface: psqlInterface
  }
}
