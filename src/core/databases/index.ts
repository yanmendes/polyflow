import psqlInterface from "./interfaces/psqlInterface";
import { sqlResolver } from "./query-resolvers";
import mysqlInterface from "./interfaces/mysqlInterface";

export const types = {
  POSTGRES: "postgres",
  MYSQL: "mysql"
};

export { psqlInterface };

const contexts = new Map([
  [types.POSTGRES, { resolver: sqlResolver, dbInterface: psqlInterface }],
  [types.MYSQL, { resolver: sqlResolver, dbInterface: mysqlInterface }]
]);

export const getResolverAndInterface = (context: string) => {
  if (!contexts.has(context)) {
    throw new Error(`Invalid context`);
  }

  return contexts.get(context);
};

export const getInterface = type => getResolverAndInterface(type).dbInterface;
