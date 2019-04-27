import sqlParser from "./sql";

// Gotta fix for multiple contexts later
const contextsRegex = /^(\w+)\[(.*)\]$/gim;
export const getContexts = (query: string) => contextsRegex.exec(query);

export const contextualizeSubQueries = (queryStmt: string) => {
  let contexts = getContexts(queryStmt);
  const contextualizedQueries = [];

  while (contexts) {
    const [, context, query] = contexts;
    contextualizedQueries.push({ context, query });
    contexts = getContexts(query);
  }

  return contextualizedQueries;
};

export { sqlParser };
