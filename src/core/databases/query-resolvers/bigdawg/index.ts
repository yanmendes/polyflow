import { Entity } from "../../../../models/polyflow";
import sqlResolver from "../sql";

const getScopeAndQuery = (query: string) => /(\w+)\((.+?)\)/gim.exec(query);
const isValidScope = (scope: string) => scope === "bdrel";
const transform = (query: string) => query.replace(/([a-z-0-9-_]+)\[(.*?)\]/gm, "__$1___$2__");

export default async (query: string, entities: [Entity]) => {
  const matches = getScopeAndQuery(query);
  if (!matches) {
    throw new Error(`Invalid bigdawg query: ${query}.`);
  }
  const [, scope, q] = matches;
  if (!isValidScope(scope)) {
    throw new Error("Invalid scope. Polyflow does not support this yet");
  }
  const transformedQuery = transform(q);
  const parsedQuery = await sqlResolver(transformedQuery, entities);

  return `${scope}(${parsedQuery})`;
};
