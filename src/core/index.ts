import { contextualizeSubQueries } from "./databases/query-resolvers";
import { getResolverAndInterface } from "./databases";
import { measure } from "../performance";
import logger, { categories } from "../logger";
import { Mediator } from "../models/polyflow";

export const runQuery = async query => {
  const log = logger.child({
    category: categories.DATABASE_INTERFACE
  });

  const mediators = await Mediator.find({ relations: ["dataSource", "entities"] });

  if (!mediators.length) {
    throw new Error("No mediators found");
  }

  const contextualizedQueries = contextualizeSubQueries(query)
    .map(
      ctx =>
        ({
          ...ctx,
          ...mediators.find(({ slug }) => slug === ctx.context)
        } || undefined)
    )
    .filter(ctx => ctx.dataSource);

  if (contextualizedQueries.length === 0) {
    throw new Error(`${query} is not a valid query or mediator does not exist`);
  }

  const results = await Promise.all(
    // Gotta also get the "context" variable later to inject the possible mediated entities and rewrite the resolver method
    contextualizedQueries.map(
      async ({ query, dataSource: { type, uri }, entities }) => {
        const { resolver, dbInterface } = getResolverAndInterface(type);
        const parsedQuery = await resolver(query, entities);

        const results = await measure(
          log.child({ query: parsedQuery }),
          `Issuing parsed query to ${type}`,
          () => dbInterface.query(uri, parsedQuery)
        );
        return results;
      }
    )
  );

  return results;
};
