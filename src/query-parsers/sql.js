import { SQL_INNER_JOIN, SQL_RIGHT_JOIN, SQL_LEFT_JOIN } from '../mediators/mediationTypes'
import KeplerMediator from '../mediators/Kepler'
import { Parser } from 'flora-sql-parser'
import _ from 'lodash'

const toSQL = require('flora-sql-parser').util.astToSQL

function handleSimpleMediation (entity) {
  return `(SELECT ${parseCols(entity.columns)} FROM ${entity.name} AS ${entity.alias})`
}

function parseCols (columns) {
  let cols = Object.values(columns)
  let aliases = Object.keys(columns)

  cols.forEach((v, k) => {
    if (k !== 'all') {
      cols[k] = v + ` as ${aliases[k]}`
    }
  })

  return _.join(cols, ', ')
}

function resolveJoin (columns, fromTable, joinTable, joinType, params) {
  return `(SELECT ${parseCols(columns)} FROM ${fromTable.name} AS ${fromTable.alias}
  ${joinType} JOIN ${joinTable.name} AS ${joinTable.alias} ON ${params[0]} = ${params[1]})`
}

function resolveUnion (entity1, entity2, cols1, cols2) {
  return `((SELECT ${parseCols(cols1)} FROM ${entity1.name} AS ${entity1.alias})
          UNION ALL
           (SELECT ${parseCols(cols2)} FROM ${entity2.name} AS ${entity2.alias}))`
}

function handleComplexMediation ({ entity1, entity2, type, columns, params }) {
  if (entity1.entity1 || entity2.entity1) {
    const query1 = entity1.entity1 ? handleComplexMediation(entity1) : handleSimpleMediation(entity1)
    const query2 = entity2.entity1 ? handleComplexMediation(entity2) : handleSimpleMediation(entity2)

    if (type === SQL_INNER_JOIN || type === SQL_LEFT_JOIN || type === SQL_RIGHT_JOIN) {
      return `(SELECT * FROM (${query1}) AS t1 ${type} JOIN (${query2}) AS t2 ON t1.${params[0]} = t2.${params[1]})`
    } else if (type === 'union') {
      return `(SELECT * FROM (${query1}) AS t1 UNION ALL (${query2}))`
    } else {
      throw new Error('No valid type was defined')
    }
  } else {
    if (type === SQL_INNER_JOIN || type === SQL_LEFT_JOIN || type === SQL_RIGHT_JOIN) {
      return resolveJoin(columns, entity1, entity2, type, params)
    } else if (type === 'union') {
      return resolveUnion(entity1, entity2)
    } else {
      throw new Error('No valid type was defined')
    }
  }
}

function mediateEntity (tableName) {
  const mediator = KeplerMediator[[tableName.toLowerCase()]]
  // This means this is a 1-1
  if (!mediator.entity2) {
    return handleSimpleMediation(mediator)
    // This means this is a 1-N
  } else {
    return handleComplexMediation(mediator)
  }
}

export default async function (query) {
  const parser = new Parser()
  let ast = parser.parse(query)
  const { from } = ast

  let i = 0
  let entities = {}

  _.forEach(from, table => {
    entities[[table.table]] = mediateEntity(table.table)
    // Forcefully adding an alias if they don't have one
    // This is done because subqueries must have an alias in SQL
    table.as = table.as ? table.as : ('table_' + i++)
  })

  let sql = toSQL(ast)

  for (const key in entities) {
    const re = new RegExp(`"${key}"`, 'gmi')
    sql = sql.replace(re, entities[[key]])
  }

  return sql.replace(/\s+as\s+"(\w+)"/gmi, ' as $1')
}
