# Polyflow.api :microscope:

## Description

`Polyflow.api` is the backend service of a syntatic and semantic data mediator. The main goal of `Polyflow` is to create more accessible data models to users that need to use queries as part of their routine but aren't technology experts, such as researchers, PMs, marketing analysts. Consider the following:

Imagine that two data analysts, Bob and Alice, help stakeholders draw sales strategies. How do they compare their data, pipelines and results? They may have different logical representations (data stores) or even different conceptual models. For now, we're gonna ignore the first problem, but if you wanna take a glimpse on how to achieve it, take a look at the [Future work section](#future-work). Even though you could argue that a simple ETL script is the way to go (and I'd have to agree with you), `Polyflow` was designed to solve this problem in a more simplistic way while providing a better experience to users that aren't even familiar with the acronym ETL.

Imagine now that Bob and Alice are interested in their **customers’ age, city and the amount they spent**. They are working in separate projects and, because of that, adopt different data models.

![alt text](https://raw.githubusercontent.com/yanmendes/polyflow.api/master/documentation/bob-alice-model.png)

They are similar (logical) models and semantically identical in this particular context. Because of that, it can be represented in a **canonical fashion**. In other words, a single **Canonical Conceptual Model (CCM)** can be used to represent data described by both models.

![alt text](https://raw.githubusercontent.com/yanmendes/polyflow.api/master/documentation/ccm.png)

And that's where `Polyflow` comes in. Kind of like [Looker](https://looker.com/), tech experts describe the mapping strategies between the CCM and the **local schemas**. Since this is a V0 and the interface is not yet ready, we'll need to use a [GraphQL](https://graphql.org/) playground to make do. `Polyflow` is available at [polyflow.api.yanmendes.dev](https://polyflow.api.yanmendes.dev).

This software derived from my master's thesis and you can check the complete work at the [References section](#references).

## Getting started

**:warning:READ THIS BEFORE YOU START:warning:**

Before we get started, we need to do a quick work-around to have our environment ready. By default, the GraphQL playground doesn't send credentials with requests. In order to access all of `Polyflow's` functionalities there is an authentication layer and, because of that, you need to include credentials in your requests. To do that, simply click the :gear: icon on the top right of the GQL playground and replace

`"request.credentials": "omit"` by `"request.credentials": "include"`

This project was made with [Apollo GraphQL :rocket:](https://apollographql.com) and, because of that, all endpoints - Queries and Mutations - are described in the **Schema** (a big green button on the right side of the screen) with their respective inputs and responses. Coming back to our example, the first thing Bob and Alice would do is register to the plataform through the `register mutation`.

```graphql
mutation Register {
  register(email: "bob@company.com", password: "123456")
}
```

After registering, they can use the `login mutation` to get access to all features of `Polyflow`. **NOTE THAT THIS WILL ONLY WORK IF YOU'VE CHANGED THE REQUEST CREDENTIALS SETTINGS**

```graphql
mutation Login {
  login(email: "bob@company.com", password: "123456") {
    id
  }
}
```

The first concept to be introduced are **Workspaces**. Think of it as a collaborative separate `Polyflow` context. All data sources, mediators and entities created can be used by all users that take part in the Workspace. To create workspaces and add users to it you can use the following mutations:

```graphql
mutation CreateWorkspace {
  createWorkspace(name: "Bob and Alice demo") {
    id
  }
}
```

```graphql
mutation addUserToWorkspace {
  addUserToWorkspace(workspaceId: 1, userId: 2)
}
```

After creating your Workspace, you can add **Data Sources** to it. For now, we only provide support to PostgreSQL, so a data source is a PSQL URL, but you can think of it as an Unique Resource Identifier (URI) to any resource accross the web - databases, files - that will be mediated by `Polyflow`. Let's connect to Bob's database via the `addDataSource mutation`.

```graphql
mutation addDataSource {
  addDataSource(
    workspaceId: 1
    type: postgres
    uri: "postgresql://postgres@localhost/bobs_db"
  ) {
    id
  }
}
```

**Mediators** are “...a software module that exploits encoded knowledge about certain sets or subsets of data to create information for a higher layer of applications.”. In simpler terms, mediators can be used to curate data, leveraging domain-specific knowledge to provide simpler and/or more semantically rich data models. Recalling our scenario, mediators would be the transformations needed to convert data described by local (Bob and Alice's) schemas to our global one (**CCM**).

Since the target CCM can have multiple **entities** that compose it, the transformations are described by a more granular abstraction. However, in order to provide a scope to transform incoming queries, we'll create a mediator using the `addMediator mutation`. Note that the **mediator's slug** will define the mediator being used to handle a query as we'll see further ahead.

```graphql
mutation addMediator {
  addMediator(
    workspaceId: 1
    dataSourceId: 1
    name: "Bob's mediator"
    slug: "bobs-mediator"
  ) {
    id
  }
}
```

**Entities** are the most crucial piece of the puzzle. The `entityMapper` prop defines the transformation from this entity's local schema to its global representation. Since `Polyflow` aims for a technology-agnostic approach, different data storages can be added by implementing new [interfaces and query parsers](https://github.com/yanmendes/polyflow.api/tree/master/src/databases). With that in mind, note that `entityMappers` structure may vary depending on the data source being used.

For now, we have a SQL query parser and a PostgreSQL interface. The relational's `entityMapper` structure can be [found here](https://github.com/yanmendes/polyflow.api/blob/master/src/types/mediation.ts). It's basic structure is composed by the table's `name`, a designed `alias`, the `columns` that will be projected and a `where` prop to filter the response.

However, since the data in our local schema may be more granular than in our CCM, we may need to `aggregate` entities to get the desired outcome. For instance, in Bob's model, the `price` of a sale is not recorded in the `Sales` entity. If we were to write a plain SQL statement to retrieve the data in our CCM's format, it would result in something along the lines of

```sql
  SELECT customer, city, value AS price FROM Sales s, Prices p WHERE s.id = p.saleId
```

Because of that, an `entityMapper` has optional fields `entity2, type, params` that allows the creation of complex entities. To create this entity for Bob and Alice's model we would use the `addEntity mutations` described below. Note that these aggregations can be recursevely defined, i.e. you can aggregate more than 2 entities - as done for Alice's model -. You can also check the [examples folder](https://github.com/yanmendes/polyflow.api/blob/master/examples) for more examples.

```graphql
mutation addBobSaleEntity {
  addEntity(
    name: "Sales"
    slug: "sales"
    workspaceId: 1
    dataSourceId: 1
    mediatorId: 1
    entityMapper: {
      entity1: { name: "Sales", alias: "s" }
      entity2: { name: "Prices", alias: "p" }
      columns: [
        { projection: "city", alias: "city" }
        { projection: "customer", alias: "customer" }
        { projection: "value", alias: "price" }
      ]
      type: "INNER"
      params: ["id", "saleId"]
    }
  ) {
    id
  }
}

mutation addAliceSaleEntity {
  addEntity(
    name: "Sales"
    slug: "sales"
    workspaceId: 1
    dataSourceId: 1
    mediatorId: 3
    entityMapper: {
      entity1: { name: "Sales", alias: "s" }
      entity2: {
        entity1: { name: "Customer", alias: "c" }
        entity2: { name: "City", alias: "city" }
        columns: [
          { projection: "c.name", alias: "customer" }
          { projection: "city.name", alias: "city" }
          { projection: "c.id", alias: "custId" }
        ]
        type: "INNER"
        params: ["c.cityId", "city.id"]
      }
      columns: [
        { projection: "city", alias: "city" }
        { projection: "customer", alias: "customer" }
        { projection: "price", alias: "price" }
      ]
      type: "INNER"
      params: ["s.customerId", "custId"]
    }
  ) {
    id
  }
}
```

Finally, after providing the proper mappings, both Alice and Bob can query the data using the GCM via the `query mutation`. As mentioned before, the **mediator's** `slug` provides Polyflow the proper context to transform incoming queries. Moreover, the slug provided in the **Entity's creation** provides Polyflow the `entityMapper` that should be used.

```graphql
mutation BobsQuery {
  query(query: "bobs-mediator[SELECT * FROM sales]")
}

mutation AlicesQuery {
  query(query: "alices-mediator[SELECT * FROM sales]")
}
```

Under the hood, `Polyflow` will transform the queries to the following ones:

```sql
SELECT *
FROM
  (SELECT city AS city,
          customer AS customer,
          value AS price
   FROM Sales AS s
   INNER JOIN Prices AS p ON id = saleId) AS table_0
```

```sql
SELECT *
FROM
  (SELECT city AS city,
          customer AS customer,
          price AS price
   FROM (
           (SELECT *
            FROM Sales AS s)) AS t1
   INNER JOIN (
                 (SELECT c.name AS customer,
                         city.name AS city,
                         c.id AS custId
                  FROM Customer AS c
                  INNER JOIN City AS city ON c.cityId = city.id)) AS t2 ON t1.s.customerId = t2.custId) AS table_0
```

## Running locally

You need to copy your `.env.sample` to a `.env` file an write your local settings there.

```sh
$ yarn
$ yarn global add typescript
$ yarn run build
$ yarn run start:prod
```

## Future work

## References

Theoretical fundamentals that guided this work - ÖZSU, M. Tamer; VALDURIEZ, Patrick. Principles of distributed database systems. **Springer Science & Business Media**, 2011.
