import sqlParser from './sql'
import psqlInterface from '../../infra/PsqlInterface'

const contexts = new Map([
  ['bdrel', { parser: sqlParser, dbInterface: psqlInterface }]
])

export const contextualizeSubQueries = (queryStmt: string) => {
  const regex = /^(bd\w+)\((.*)\)$/gmi
  let regexResult = regex.exec(queryStmt)
  const contextualizedQueries = []

  while (regexResult) {
    const [, context, query] = regexResult
    contextualizedQueries.push({ context, query })
    regexResult = regex.exec(query)
  }

  return contextualizedQueries
}

export const getParserAndInterface = (context: string) => {
  if (!contexts.has(context)) {
    throw new Error(`Invalid context`)
  }

  return contexts.get(context)
}
