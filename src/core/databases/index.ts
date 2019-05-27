import psqlInterface from "./interfaces/psqlInterface";
import { sqlResolver } from "./query-resolvers";

export const types = {
  POSTGRES: "postgres"
};

export { psqlInterface };

export const getInterface = type =>
  type === types.POSTGRES ? psqlInterface : undefined;

const contexts = new Map([
  [types.POSTGRES, { resolver: sqlResolver, dbInterface: psqlInterface }]
]);

export const getResolverAndInterface = (context: string) => {
  if (!contexts.has(context)) {
    throw new Error(`Invalid context`);
  }

  return contexts.get(context);
};
