import sqlResolver from "./sql";

// Gotta fix for multiple contexts later
const contextsRegex = /([a-z-_]+)\[(.+?)\]/gim;
export const getContexts = (query: string) => contextsRegex.exec(query);

export const contextualizeSubQueries = (queryStmt: string) => {
  let matches;
  const contextualizedQueries = [];

  while ((matches = getContexts(queryStmt))) {
    const [, context, query] = matches;
    contextualizedQueries.push({ context, query });
  }

  return contextualizedQueries;
};

export { sqlResolver };
