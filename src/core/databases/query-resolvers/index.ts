import sqlResolver from "./sql";
import bigdawgResolver from "./bigdawg";

const contextsRegex = /([a-z-0-9-_]+)\[([a-z-0-9-_]+)\]/gim;
const getContexts = (query: string) => contextsRegex.exec(query);

export const getMediatedEntities = (queryStmt: string) => {
  let matches;
  const entities = [];

  while ((matches = getContexts(queryStmt))) {
    const [, mediator, entity] = matches;
    entities.push({ mediator, entity });
  }

  return entities;
};

export { sqlResolver, bigdawgResolver };
