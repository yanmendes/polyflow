import { gql } from "apollo-server-express";

export default gql`
  scalar JSON

  enum DataSourceType {
    postgres
    mysql
  }

  type DataSource {
    id: ID!
    uri: String!
    type: DataSourceType!
  }

  type Mediator {
    id: ID!
    name: String!
    slug: String!
  }

  type SQLColumn {
    projection: String!
    alias: String
  }

  enum SQLAggregationType {
    INNER
    LEFT
    RIGHT
    UNION
  }

  type SQLEntityMapper {
    entity1: JSON!
    entity2: JSON
    "Valid types for SQL: INNER, LEFT, RIGHT, UNION"
    type: SQLAggregationType
    columns: [SQLColumn]
    params: [String]
  }

  type Entity {
    id: ID!
    name: String!
    slug: String!
    entityMapper: SQLEntityMapper!
  }

  type Query {
    query(query: String!): JSON
  }

  input SQLColumnInput {
    projection: String!
    alias: String
  }

  input SQLEntityMapperInput {
    entity1: JSON
    entity2: JSON
    name: String
    alias: String
    type: String
    columns: [SQLColumnInput]
    params: [String]
    where: String
  }

  type Mutation {
    addDataSource(
      type: DataSourceType!
      uri: String!
    ): DataSource
    addMediator(
      name: String!
      slug: String!
      dataSourceId: ID!
    ): Mediator
    addEntity(
      name: String!
      slug: String!
      entityMapper: SQLEntityMapperInput!
      mediatorId: ID!
    ): Entity
  }
`;
