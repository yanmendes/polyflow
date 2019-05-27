import { Parser } from "flora-sql-parser";

import {
  SQL_INNER_JOIN,
  SQL_RIGHT_JOIN,
  SQL_LEFT_JOIN,
  SQL_UNION
} from "../../mediationTypes";
import { MediationError } from "../../CustomErrors";
import { Entity } from "../../models/polyflow";

const sql = require("tagged-template-noop");
const toSQL = require("flora-sql-parser").util.astToSQL;

function isMediationEntity(
  entity: MediationEntity | SQLTable
): entity is MediationEntity {
  return (entity as MediationEntity).entity1 !== undefined;
}

function isSQLTable(entity: MediationEntity | SQLTable): entity is SQLTable {
  return (entity as SQLTable).name !== undefined;
}

const getAlias = (alias: string) => (alias ? ` as ${alias}` : "");

const parseCols = (columns: SQLColumn[]) =>
  !columns || !columns.length
    ? "*"
    : columns
        .map(({ projection, alias }) => `${projection} ${getAlias(alias)}`)
        .join(",");

const getParams = (params: string[]) =>
  params.length === 3 ? params.join(" ") : `${params[0]} = ${params[1]}`;

const resolveJoin = (
  columns: SQLColumn[],
  fromTable: SQLTable,
  joinTable: SQLTable,
  joinType: string,
  params: string[]
) =>
  sql`(
    SELECT ${parseCols(columns)}
    FROM ${fromTable.name} ${getAlias(fromTable.alias)}
    ${joinType} JOIN ${joinTable.name} ${getAlias(joinTable.alias)}
      ON ${getParams(params)}
  )`;

const resolveUnion = (entity1: SQLTable, entity2: SQLTable): string =>
  sql`(
    (
      SELECT ${parseCols(entity1.columns)}
      FROM ${entity1.name} ${getAlias(entity1.alias)}
    )
    UNION ALL
    (
      SELECT ${parseCols(entity2.columns)}
      FROM ${entity2.name} ${getAlias(entity2.alias)}
    )
  )`;

const getWhereStatement = (where: string) => (where ? `WHERE ${where}` : "");

const handleSimpleMediation = (SQLTable: SQLTable): string => {
  validateSQLTable(SQLTable);

  return sql`(
    SELECT ${parseCols(SQLTable.columns)}
    FROM ${SQLTable.name} ${getAlias(SQLTable.alias)}
    ${getWhereStatement(SQLTable.where)}
  )`;
};

function handleComplexMediation(mediator: MediationEntity): string {
  validateMediator(mediator);

  const { entity1, entity2, type, columns, params } = mediator;
  if (isMediationEntity(entity1) || isMediationEntity(entity2)) {
    const query1 = isMediationEntity(entity1)
      ? handleComplexMediation(entity1)
      : handleSimpleMediation(entity1);
    const query2 = isMediationEntity(entity2)
      ? handleComplexMediation(entity2)
      : handleSimpleMediation(entity2);

    if ([SQL_INNER_JOIN, SQL_LEFT_JOIN, SQL_RIGHT_JOIN].includes(type)) {
      return resolveJoin(
        columns,
        {
          name: `(${query1})`,
          alias: "t1"
        },
        {
          name: `(${query2})`,
          alias: "t2"
        },
        type,
        params
      );
    } else if (type === SQL_UNION) {
      return resolveUnion(
        { name: `(${query1})`, alias: "table_0" },
        { name: `(${query2})`, alias: "table_1" }
      );
    } else {
      throw new MediationError("No valid type was defined", mediator);
    }
  } else if (isSQLTable(entity1) && isSQLTable(entity2)) {
    if ([SQL_INNER_JOIN, SQL_LEFT_JOIN, SQL_RIGHT_JOIN].includes(type)) {
      return resolveJoin(columns, entity1, entity2, type, params);
    } else if (type === SQL_UNION) {
      return resolveUnion(entity1, entity2);
    } else {
      throw new MediationError("No valid type was defined", mediator);
    }
  }
}

function validateSQLTable(entity: SQLTable) {
  if (!entity.name) {
    throw new MediationError("Table name not set for SQLTable", entity);
  }
}

function validateMediator(mediator: MediationEntity) {
  const { entity1, entity2, params, type } = mediator;
  if (!entity1) {
    throw new MediationError("Entity 1 not set for mediator", mediator);
  } else if (entity2 && !type) {
    throw new MediationError("Type not set for mediator", mediator);
  } else if (
    [SQL_INNER_JOIN, SQL_LEFT_JOIN, SQL_RIGHT_JOIN].includes(type) &&
    (!params || params.length < 2)
  ) {
    throw new MediationError("Type set as Join but no param set", mediator);
  } else if (
    type === "union" &&
    (!entity2 ||
      !entity1.columns ||
      !entity2.columns ||
      entity1.columns.length !== entity2.columns.length)
  ) {
    throw new MediationError(
      "Type set as Union but the columns are invalid",
      mediator
    );
  }
}

function mediateEntity(mediator): string {
  // This means this is a 1-1
  if (isSQLTable(mediator)) {
    return handleSimpleMediation(mediator);
    // This means this is a 1-N
  } else if (isMediationEntity(mediator)) {
    return handleComplexMediation(mediator);
  }
}

export { validateMediator, validateSQLTable };

const sanitize = (query: string) => query.replace(/\\n/, "");

export default async function(query: string, entities: [Entity]) {
  const parser = new Parser();
  let ast = parser.parse(query);
  const { from } = ast;

  let i = 0;
  const queries = new Map<string, string>();

  for (const entity of from) {
    const mediationEntity = entities.find(
      ({ slug }) => slug === entity.table.toLowerCase()
    );
    const mediatedQuery = mediateEntity(mediationEntity.entityMapper);
    queries.set(entity.table, mediatedQuery);
    // Forcefully adding an alias if they don't have one
    // This is done because subqueries must have an alias in SQL
    entity.as = entity.as ? entity.as : "table_" + i++;
  }

  let sql = toSQL(ast);

  queries.forEach((value: string, key: string) => {
    const re = new RegExp(`"${key}"`, "gmi");
    sql = sql.replace(re, value);
  });

  return sanitize(sql).replace(/\s+as\s+"(\w+)"/gim, " as $1");
}
