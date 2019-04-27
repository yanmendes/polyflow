import { User, DataSource } from "../models/polyflow";
import {
  contextualizeSubQueries,
  getParserAndInterface
} from "../query-parsers";

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
      const results = await dbInterface.query(process.env.PG_URI, parsedQuery);
      return results;
    })
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
