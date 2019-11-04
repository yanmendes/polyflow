import { gql } from 'apollo-server-express'

export default gql`
  scalar JSON

  type Query {
    query(query: String!): JSON
    dataSources: [DataSource]
    mediators: [Mediator]
    entities: [Entity]
  }

  type Mutation {
    addDataSource(dataSource: DataSourceInput!): DataSource
    addMediator(mediator: MediatorInput!): Mediator
    addEntity(entity: EntityInput!): Entity
    register(user: UserInput!): String
  }

  # Types

  type DataSource {
    id: ID!
    uri: String!
    slug: String
    type: DataSourceType!
    mediators: [Mediator]
  }

  type Mediator {
    id: ID!
    name: String!
    slug: String!
    dataSource: DataSource
    entities: [Entity]
  }

  type Entity {
    id: ID!
    name: String!
    slug: String!
    entityMapper: SQLEntityMapper!
    mediator: Mediator
  }

  type SQLColumn {
    projection: String!
    alias: String
  }

  type SQLEntityMapper {
    entity1: JSON
    entity2: JSON
    name: String
    alias: String
    "Valid types for SQL: INNER, LEFT, RIGHT, UNION"
    type: SQLAggregationType
    columns: [SQLColumn]
    params: [String]
    where: String
  }

  # Inputs

  input UserInput {
    email: String!
    password: String!
  }

  input DataSourceInput {
    type: DataSourceType!
    uri: String!
    slug: String!
  }

  input MediatorInput {
    name: String!
    slug: String!
    dataSourceSlug: String!
  }

  input EntityInput {
    name: String!
    slug: String!
    entityMapper: SQLEntityMapperInput!
    mediatorSlug: String!
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
    "Valid types for SQL: INNER, LEFT, RIGHT, UNION"
    type: SQLAggregationType
    columns: [SQLColumnInput]
    params: [String]
    where: String
  }

  # Enums

  enum DataSourceType {
    postgres
    mysql
    bigdawg
  }

  enum SQLAggregationType {
    INNER
    LEFT
    RIGHT
    UNION
  }
`
