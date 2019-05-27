import { getConnection } from "typeorm";

import { contextualizeSubQueries } from "./databases/query-resolvers";
import { getResolverAndInterface } from "./databases";
import { measure } from "../performance";
import logger, { categories } from "../logger";
import { getCurrentUser } from "../services";
import { DataSource, Mediator, Workspace, Entity } from "../models/polyflow";

const getMediators = req =>
  getCurrentUser(req).then(user =>
    getConnection()
      .createQueryBuilder()
      .addSelect("mediator")
      .from(Mediator, "mediator")
      .innerJoinAndSelect(
        DataSource,
        "dataSource",
        `dataSource.id=mediator."dataSourceId"`
      )
      .innerJoinAndSelect(
        Workspace,
        "workspace",
        `workspace.id="dataSource"."workspaceId"`
      )
      .getRawMany()
      .then(mediators =>
        mediators.filter(({ workspace_id }) =>
          user.workspaces.find(({ id }) => parseInt(workspace_id, 10) === id)
        )
      )
      .then(mediators =>
        Promise.all(
          mediators.map(async mediator => ({
            ...mediator,
            entities: await Entity.find({
              mediator: mediator.mediator_id
            })
          }))
        )
      )
  );

export const runQuery = async (query, req) => {
  const log = logger.child({
    category: categories.DATABASE_INTERFACE
  });

  const mediators = await getMediators(req);

  if (!mediators.length) {
    throw new Error("No mediators found");
  }

  const contextualizedQueries = contextualizeSubQueries(query)
    .map(
      ctx =>
        ({
          ...ctx,
          ...mediators.find(
            ({ mediator_slug }) => mediator_slug === ctx.context
          )
        } || undefined)
    )
    .filter(ctx => ctx.dataSource_type);

  if (contextualizedQueries.length > 1) {
    throw new Error(`Can't support multiple queries yet`);
  } else if (contextualizedQueries.length === 0) {
    throw new Error(`${query} is not a valid query or mediator does not exist`);
  }

  const results = await Promise.all(
    // Gotta also get the "context" variable later to inject the possible mediated entities and rewrite the resolver method
    contextualizedQueries.map(
      async ({ query, dataSource_type, dataSource_uri, entities }) => {
        const { resolver, dbInterface } = getResolverAndInterface(
          dataSource_type
        );
        const parsedQuery = await resolver(query, entities);

        const results = await measure(
          log.child({ query: parsedQuery }),
          "Issuing parsed query to PSQL",
          () => dbInterface.query(dataSource_uri, parsedQuery)
        );
        return results;
      }
    )
  );

  return results;
};
