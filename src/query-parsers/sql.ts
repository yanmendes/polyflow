import { SQL_INNER_JOIN, SQL_RIGHT_JOIN, SQL_LEFT_JOIN } from '../mediators/mediationTypes'
import KeplerMediator from '../mediators/Kepler'
import { Parser } from 'flora-sql-parser'
import { MediationError } from '../CustomErrors'
import { stringify } from 'querystring'

const toSQL = require('flora-sql-parser').util.astToSQL

function isMediationEntity (entity: MediationEntity | SQLTable): entity is MediationEntity {
  return (entity as MediationEntity).entity1 !== undefined
}

function isSQLTable (entity: MediationEntity | SQLTable): entity is SQLTable {
  return (entity as SQLTable).name !== undefined
}

function parseCols (columns: any) {
  let cols = Object.values(columns)
  let aliases = Object.keys(columns)

  cols.forEach((v, k) => {
    cols[k] = v + ` as ${aliases[k]}`
  })

  return cols.join(',')
}

function resolveJoin (columns: Object, fromTable: SQLTable, joinTable: SQLTable, joinType: string, params: string[]) {
  if (!columns || !fromTable || !joinTable || !joinType || !params) {
    throw new MediationError(`Error resolving join`, { columns, fromTable, joinTable, joinType, params })
  }

  return `(SELECT ${parseCols(columns)} FROM ${fromTable.name} AS ${fromTable.alias}
  ${joinType} JOIN ${joinTable.name} AS ${joinTable.alias} ON ${params[0]} = ${params[1]})`
}

function resolveUnion (entity1: SQLTable, entity2: SQLTable) {
  if (!entity1 || !entity2 || !entity1.columns || !entity2.columns) {
    throw new MediationError(`Error resolving union`, { entity1, entity2 })
  }
  return `((SELECT ${parseCols(entity1.columns)} FROM ${entity1.name} AS ${entity1.alias})
          UNION ALL
           (SELECT ${parseCols(entity2.columns)} FROM ${entity2.name} AS ${entity2.alias}))`
}

function handleSimpleMediation (SQLTable: SQLTable) {
  validateSQLTable(SQLTable)
  if (!SQLTable || !SQLTable.columns || !SQLTable.name || !SQLTable.alias) {
    throw new MediationError(`Invalid entity`, SQLTable)
  }
  return `(SELECT ${parseCols(SQLTable.columns)} FROM ${SQLTable.name} AS ${SQLTable.alias})`
}

function handleComplexMediation (mediator: MediationEntity): string {
  validateMediator(mediator)
  const { entity1, entity2, type, columns, params } = mediator
  if (isMediationEntity(entity1) || isMediationEntity(entity2)) {
    const query1 = isMediationEntity(entity1) ? handleComplexMediation(entity1) : handleSimpleMediation(entity1)
    const query2 = isMediationEntity(entity2) ? handleComplexMediation(entity2) : handleSimpleMediation(entity2)

    if (type === SQL_INNER_JOIN || type === SQL_LEFT_JOIN || type === SQL_RIGHT_JOIN) {
      return `(SELECT * FROM (${query1}) AS t1 ${type} JOIN (${query2}) AS t2 ON t1.${params[0]} = t2.${params[1]})`
    } else if (type === 'union') {
      return `(SELECT * FROM (${query1}) AS t1 UNION ALL (${query2}))`
    } else {
      throw new Error('No valid type was defined')
    }
  } else if (isSQLTable(entity1) && isSQLTable(entity2)) {
    if (type === SQL_INNER_JOIN || type === SQL_LEFT_JOIN || type === SQL_RIGHT_JOIN) {
      return resolveJoin(columns, entity1, entity2, type, params)
    } else if (type === 'union') {
      return resolveUnion(entity1, entity2)
    } else {
      throw new Error('No valid type was defined')
    }
  }
}

function validateSQLTable (entity: SQLTable) {
  if (!entity.name) {
    throw new MediationError('Table name not set for SQLTable', entity)
  } else if (!entity.alias) {
    throw new MediationError('Alias not set for SQLTable', entity)
  }
}

function validateMediator (mediator: MediationEntity) {
  if (!mediator.entity1) {
    throw new MediationError('Entity 2 not set for mediator', mediator)
  } else if (mediator.entity2 && !mediator.type) {
    throw new MediationError('Type not set for mediator', mediator)
  } else if ([SQL_INNER_JOIN, SQL_LEFT_JOIN, SQL_RIGHT_JOIN].includes(mediator.type) && !mediator.params) {
    throw new MediationError('Type set as Join but no param set', mediator)
  } else if (mediator.type === 'union' &&
    (!mediator.entity2 || !mediator.entity1.columns || !mediator.entity2.columns ||
      Object.keys(mediator.entity1.columns).length !== Object.keys(mediator.entity1.columns).length)) {
    throw new MediationError('Type set as Union but one of the entities is invalid', mediator)
  }
}

function mediateEntity (entityName: string): string {
  if (!KeplerMediator.has(entityName)) {
    throw new MediationError(`Entity does not exist in mediator`, { mediator: KeplerMediator, tableName: entityName })
  }
  const mediator = KeplerMediator.get(entityName)

  console.log(mediator)

  // This means this is a 1-1
  if (isSQLTable(mediator)) {
    return handleSimpleMediation(mediator)
    // This means this is a 1-N
  } else if (isMediationEntity(mediator)) {
    return handleComplexMediation(mediator)
  }
}

export { validateMediator, validateSQLTable }

export default async function (query: string) {
  const parser = new Parser()
  let ast = parser.parse(query)
  const { from } = ast

  let i = 0
  const entities = new Map<string, string>()

  for (const table of from) {
    entities.set(table.table, mediateEntity(table.table.toLowerCase()))
    // Forcefully adding an alias if they don't have one
    // This is done because subqueries must have an alias in SQL
    table.as = table.as ? table.as : ('table_' + i++)
  }

  let sql = toSQL(ast)

  entities.forEach((value: string, key: string) => {
    const re = new RegExp(`"${key}"`, 'gmi')
    sql = sql.replace(re, value)
  })

  return sql.replace(/\s+as\s+"(\w+)"/gmi, ' as $1')
}
