import psqlInterface from "./psqlInterface";
import { sqlParser } from "./query-parsers";

export const types = {
  POSTGRES: "postgres"
};

export { psqlInterface };

export const getInterface = type =>
  type === types.POSTGRES ? psqlInterface : undefined;

const contexts = new Map([
  [types.POSTGRES, { parser: sqlParser, dbInterface: psqlInterface }]
]);

export const getParserAndInterface = (context: string) => {
  if (!contexts.has(context)) {
    throw new Error(`Invalid context`);
  }

  return contexts.get(context);
};
