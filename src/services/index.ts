import { User, DataSource, Mediator, Workspace } from "../models/polyflow";
import { contextualizeSubQueries } from "../databases/query-parsers";
import { getParserAndInterface } from "../databases";
import { getConnection } from "typeorm";

export const getWorkspace = (req, workspaceId) =>
  getCurrentUser(req)
    .then(user =>
      user.workspaces.find(({ id }) => parseInt(workspaceId, 10) === id)
    )
    .then(workspace => {
      if (!workspace) {
        throw new Error("user does not belong to workspace");
      }
      return workspace;
    });

export const getCurrentUser = req => {
  if (!req.session.userId) {
    throw new Error("You must be logged in to access this feature");
  }

  return User.findOne(req.session.userId, { relations: ["workspaces"] });
};

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
  );

export const runQuery = async (query, req) => {
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
    .filter(ctx => ctx);

  if (contextualizedQueries.length > 1) {
    throw new Error(`Can't support multiple queries yet`);
  } else if (contextualizedQueries.length === 0) {
    throw new Error(`${query} is not a valid query or mediator does not exist`);
  }

  const results = await Promise.all(
    // Gotta also get the "context" variable later to inject the possible mediated entities and rewrite the parser method
    contextualizedQueries.map(
      async ({ query, dataSource_type, dataSource_uri }) => {
        const { parser, dbInterface } = getParserAndInterface(dataSource_type);
        const parsedQuery = await parser(query);

        req.log.info(parsedQuery);
        const results = await dbInterface.query(dataSource_uri, parsedQuery);
        return results;
      }
    )
  );

  return results;
};

export const getDataSource = (req, workspaceId, dataSourceId) =>
  // Gotta replace this later by adding all nested fields to getUser query.. https://typeorm.io/#/find-options/basic-options
  getWorkspace(req, workspaceId)
    .then(_ => DataSource.findOne(dataSourceId, { relations: ["workspace"] }))
    .then(
      dataSource =>
        dataSource.workspace.id === parseInt(workspaceId, 10) && dataSource
    )
    .then(dataSource => {
      if (!dataSource) {
        throw new Error("Data source does not belong to workspace");
      }
      return dataSource;
    });

export const getMediator = (req, workspaceId, dataSourceId, mediatorId) =>
  getDataSource(req, workspaceId, dataSourceId)
    .then(_ => Mediator.findOne(mediatorId, { relations: ["dataSource"] }))
    .then(
      mediator =>
        mediator.dataSource.id === parseInt(dataSourceId, 10) && mediator
    )
    .then(mediator => {
      if (!mediator) {
        throw new Error("Mediator does not belong to data source");
      }
      return mediator;
    });
