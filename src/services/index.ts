import { User } from "../models/polyflow";
import {
  contextualizeSubQueries,
  getParserAndInterface
} from "../query-parsers";

export const getCurrentUser = req => {
  if (!req.session.userId) {
    throw new Error("You must be logged in to access this feature");
  }

  return User.findOne(req.session.userId, { relations: ["workspaces"] });
};

export const runQuery = async (query, req) => {
  const contextualizedQueries = contextualizeSubQueries(query);

  if (contextualizedQueries.length > 1) {
    throw new Error(`Can't support multiple queries yet`);
  } else if (contextualizedQueries.length === 0) {
    throw new Error(`${query} is not a valid query`);
  }

  const results = await Promise.all(
    contextualizedQueries.map(async ({ context, query }) => {
      const { parser, dbInterface } = getParserAndInterface(context);
      const parsedQuery = await parser(query);

      req.log.info(parsedQuery);
      const results = await dbInterface(parsedQuery);
      return results;
    })
  );

  return results;
};
