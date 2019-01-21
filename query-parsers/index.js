const
  sqlParser = require('../query-parsers/sql'),
  psqlInterface = require('../infra/PsqlInterface'),
  neo4j = require('../infra/Neo4Interface')

module.exports = {
  resolveContext: function (query) {
    const regex = /^(bd\w+)\((.*)\)$/gmi
    const result = regex.exec(query)
    if (!result)
      throw new Error(`Invalid query statement: ${query}`)

    let context = result[1]
    query = result[2]

    if (query.startsWith('bd'))
      return {
        context, query: resolveContext(query)
      }

    return { context, query }
  },

  contexts: {
    bdrel: {
      parser: sqlParser,
      dbInterface: psqlInterface
    }
  }
}
