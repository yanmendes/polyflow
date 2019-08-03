import { getMediatedEntities } from "./databases/query-resolvers";
import { getResolverAndInterface } from "./databases";
import { measure } from "../performance";
import logger, { categories } from "../logger";
import { Mediator } from "../models/polyflow";
import { UserInputError } from "apollo-server-core";

export const runQuery = async query => {
  const log = logger.child({
    category: categories.DATABASE_INTERFACE
  });

  const mediators = await Mediator.find({
    relations: ["dataSource", "entities"]
  });

  if (!mediators.length) {
    throw new Error("No mediators found");
  }

  const mediatedEntities = getMediatedEntities(query)
    .map(
      query =>
        ({
          ...query,
          ...mediators.find(({ slug }) => slug === query.mediator)
        } || undefined)
    )
    .filter(ctx => ctx.dataSource);

  if (mediatedEntities.length === 0) {
    throw new Error(`${query} is not a valid query or mediator does not exist`);
  }

  const { uri, type } = mediatedEntities[0].dataSource;
  const hasDifferentDataSources = () =>
    !!mediatedEntities.filter(({ dataSource }) => dataSource.uri !== uri).length;

  if (hasDifferentDataSources()) {
    throw new Error(`Invalid query, it uses mediators with different data sources`);
  }

  const { resolver, dbInterface } = getResolverAndInterface(type);

  const entities = mediatedEntities.reduce(
    (prev, { slug: mediatorSlug, entities }) => [
      ...prev,
      ...entities.map(({ slug, ...rest }) => ({
        slug: `__${mediatorSlug}___${slug}__`,
        ...rest
      }))
    ],
    []
  );

  try {
    const parsedQuery = (await resolver(query, entities)).replace(/\s+/g, " ");
    return measure(log.child({ query: parsedQuery }), `Issuing parsed query to ${type}`, () =>
      dbInterface.query(uri, parsedQuery)
    );
  } catch (e) {
    throw new UserInputError(
      `Couldn't resolve the query. It's either an invalid SQL statement or wrong Polyflow syntax.
       Check the docs https://github.com/yanmendes/polyflow`
    );
  }
};
