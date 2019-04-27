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

  type DataSource {
    id: ID!
    uri: String
  }

  type Query {
    getWorkspaces: [Workspace]
    getDataSource(uri: String): DataSource
  }

  type Mutation {
    register(email: String!, password: String!): Boolean!
    login(email: String!, password: String!): User
    logout: Boolean!
    createWorkspace(name: String!): Workspace!
    addUserToWorkspace(workspaceId: ID!, userId: ID!): Boolean!
    query(query: String!): JSON
    addDataSource(workspaceId: ID!, type: String, uri: String): Boolean
    addMediator(
      name: String!
      slug: String!
      entityMapper: JSON!
      workspaceId: ID!
      dataSourceId: ID!
    ): Boolean
  }
`;
