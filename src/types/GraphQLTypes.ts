import { gql } from "apollo-server-express";

export default gql`
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
  type Query {
    getWorkspaces: [Workspace]
  }
  type Mutation {
    register(email: String!, password: String!): Boolean!
    login(email: String!, password: String!): User
    logout: Boolean!
    createWorkspace(name: String!): Workspace!
    addUserToWorkspace(workspaceId: ID!, userId: ID!): Boolean!
  }
`;
