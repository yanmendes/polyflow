import { gql } from "apollo-server-express";

export default gql`
  scalar JSON

  type User {
    id: ID!
    email: String!
    workspaces: [Workspace]
  }

  type Workspace {
    id: ID!
    name: String!
    user: User!
  }

  enum DataSourceType {
    postgres
  }

  type DataSource {
    id: ID!
    uri: String
    type: DataSourceType
  }

  type Query {
    getWorkspaces: [Workspace]
    getDataSource(uri: String): DataSource
  }

  input SQLColumnInput {
    projection: String
    alias: String
  }

  input SQLEntityMapperInput {
    entity1: JSON!
    entity2: JSON
    type: String
    columns: [SQLColumnInput]
    params: [String]
  }

  type Mutation {
    register(email: String!, password: String!): Boolean!
    login(email: String!, password: String!): User
    logout: Boolean!
    createWorkspace(name: String!): Workspace!
    addUserToWorkspace(workspaceId: ID!, userId: ID!): Boolean!
    query(query: String!): JSON
    addDataSource(
      workspaceId: ID!
      type: DataSourceType
      uri: String
    ): DataSource
    addMediator(
      name: String!
      slug: String!
      workspaceId: ID!
      dataSourceId: ID!
    ): Boolean
    addEntity(
      name: String!
      slug: String!
      entityMapper: SQLEntityMapperInput!
      workspaceId: ID!
      dataSourceId: ID!
      mediatorId: ID!
    ): Boolean
  }
`;
