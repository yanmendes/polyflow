import psqlInterface from "./interfaces/psqlInterface";
import { sqlResolver } from "./query-resolvers";
import mysqlInterface from "./interfaces/mysqlInterface";
import bigdawgInterface from "./interfaces/bigdawgInterface";

export const types = {
  POSTGRES: "postgres",
  MYSQL: "mysql",
  BIGDAWG: "bigdawg"
};

export { psqlInterface };

const contexts = new Map([
  [types.POSTGRES, { resolver: sqlResolver, dbInterface: psqlInterface }],
  [types.MYSQL, { resolver: sqlResolver, dbInterface: mysqlInterface }],
  [types.BIGDAWG, { resolver: sqlResolver, dbInterface: bigdawgInterface }]
]);

export const getResolverAndInterface = (context: string) => {
  if (!contexts.has(context)) {
    throw new Error(`Invalid context`);
  }

  return contexts.get(context);
};

export const getInterface = type => getResolverAndInterface(type).dbInterface;
