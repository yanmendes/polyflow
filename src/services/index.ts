import * as jwt from "jsonwebtoken";

import { User, DataSource, Mediator } from "../models/polyflow";
import { JWT_SECRET } from "../config";

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
  const authToken = req.cookies["auth-cookie"];
  if (!authToken) {
    throw new Error("You must be logged in to access this feature");
  }
  const { userId } = jwt.verify(authToken, JWT_SECRET);
  if (!userId) {
    throw new Error("Invalid token. Try cleaning up your cookies");
  }

  return User.findOne(userId, { relations: ["workspaces"] });
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
