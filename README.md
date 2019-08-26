# polyflow :microscope:

## Description

`polyflow` is a syntatic and semantic data mediator. The main goal of `polyflow` is to create more accessible data models to users that need to use queries as part of their routine but aren't technology experts, such as researchers, PMs, marketing analysts. Consider the following:

Imagine that two reaserchers, Bob and Alice, share the same research field and tackle the problem using computer simulations. Simulations are usually structured as **[workflows](#references)** that have some input, a sequence of programs that transform them and generate some output. But how do they compare their data, pipelines and results since they use different orchestrators for their workflows?

Each orchestrator, or [Workflow Management Systems (WFMSs)](#references), have their own implementation and storing mechanism. These tools offer exports of raw data in a structured way (such as relational and non-relational databases) so that reasearchers can query and analyze their findings.

Coming back to Bob and Alice's scenario, since they use different WFMSs, the exported data may not be compatible for comparison right away. In other words, there might be different logical representations (data stores) or even different conceptual models. `polyflow` was designed to solve this problem in a simple way.

Imagine that Bob and Alice are interested in **how much time** their pipelines take. Let's assume Bob uses [Kepler](https://kepler-project.org/) to orchestrate his workflow while Alice uses [Swift/T](http://swift-lang.org/Swift-T/). The image below shows the entities in each WFMS's data model that capture such information.

![alt text](https://raw.githubusercontent.com/yanmendes/polyflow.api/master/documentation/bob-alice-model.png)

They are similar (logical) models and semantically identical. Because of that, it can be represented in a **canonical fashion**. In other words, a single **Canonical Conceptual Model (CCM)** can be used to represent data described by both models.

![alt text](https://raw.githubusercontent.com/yanmendes/polyflow.api/master/documentation/ccm.png)

And that's where `polyflow` comes in. Database experts/tech savy people describe mapping strategies between the CCM and the **local schemas** using an object-like syntax so that reasearchers can query a single, simplified data model.

This software is derived from my master's thesis and you can check the [References section](#references) for aditional information.

# Requirements

All you need [Docker](https://www.docker.com/) to run `polyflow`. To install it, just see the guide for your OS:

- [MacOS](https://docs.docker.com/docker-for-mac/install/)

- [Windows](https://docs.docker.com/docker-for-windows/install/)

- [Ubuntu](https://phoenixnap.com/kb/how-to-install-docker-on-ubuntu-18-04)

## Running dockerized version

First, you need to create a docker network to enable communication between containers. To do that, run:

```sh
  docker network create polyflow
```

If you have containerized databases that you wish to connect to `polyflow`, make sure to add them to the network.

To run the application just run the script below. It launches two docker containers: one containing the dockerized application and the other a database that serves as a catalog to `polyflow`.

```sh
  docker-compose up polyflow
```

To make sure your installation worked, open http://localhost:3050. There should be a blue screen with a big play button in the middle. This is a [GraphQL playground](https://www.prisma.io/blog/introducing-graphql-playground-f1e0a018f05d) and where you'll be interacting with polyflow. GraphQL is a query language for APIs. To check out the endpoints of `polyflow`, click the `Schema` button on the right side of the screen. The GraphQL playground provides auto-complete to queries and mutations by tapping `ctrl + space`.

## Running examples

The [examples](./examples) folder contains two implemented examples: one using PostgreSQL and MySQL databases and other using [BigDAWG](https://bigdawg.mit.edu): a polystore database system. There are `README` files in directories that explain how to run each example.

## Understanding polyflow

This section provides an overview of `polyflow's` core concepts and how to interact with them. This is **NOT** a valid example and errors will be thrown if you try to execute these queries and mutations. For actual examples, check the [examples](./examples) folder.

There are three main concepts in polyflow: `Data Sources`, `Mediators` and `Entities`. In terms of our example, a **data source** is where the resources are located. We provide support to PostgreSQL and [BigDAWG](https://bigdawg.mit.edu), so a data source is a PSQL URL or a BigDAWG endpoint, but you can think of it as an Unique Resource Identifier (URI) to any resource accross the web - databases, files - that will be mediated by `polyflow`. Let's connect to Bob's database via the `addDataSource mutation`.

```graphql
mutation addDataSource {
  addDataSource(dataSource: { type: postgres, uri: "<bob's-db-URI>", slug: "bobs-db" }) {
    slug
  }
}
```

To fetch your `Data Sources`, you should run the `dataSources query`:

```graphql
query {
  dataSources {
    id
    uri
    type
  }
}
```

**Mediators** are “...a software module that exploits encoded knowledge about certain sets or subsets of data to create information for a higher layer of applications.”. In simpler terms, mediators can be used to curate data, leveraging domain-specific knowledge to provide simpler and/or more semantically rich data models. Recalling our scenario, mediators would be the transformations needed to convert data described by local (Bob and Alice's) schemas to our global one (**CCM**).

Since the target CCM can have multiple **entities** that compose it, the transformations are described by a more granular abstraction. However, in order to provide a scope to transform incoming queries, we'll create a mediator using the `addMediator mutation`. Note that the **mediator's slug** will define the mediator being used to handle a query as we'll see further ahead.

```graphql
# Write your query or mutation here
mutation {
  addMediator(mediator: { dataSourceSlug: "bobs-db", name: "Bob's mediator", slug: "bob" }) {
    id
  }
}
```

**Entities** are the most crucial piece of the puzzle. The `entityMapper` prop defines the transformation from this entity's local schema to its global representation. Since `polyflow` aims for a technology-agnostic approach, different data storages can be added by implementing new [interfaces and query resolvers](https://github.com/yanmendes/polyflow.api/tree/master/src/core/databases). With that in mind, note that `entityMappers` structure may vary depending on the data source being used.

For now, we have a SQL query resolver and a PostgreSQL interface. The relational's `entityMapper` structure can be [found here](https://github.com/yanmendes/polyflow.api/blob/master/src/types/mediation.ts). It's basic structure is composed by the table's `name`, a designed `alias`, the `columns` that will be projected and a `where` prop to filter the response.

However, since the data in our local schema may be more granular than in our CCM, we may need to `aggregate` entities to get the desired outcome. For instance, in Bob's model, the `price` of a sale is not recorded in the `Sales` entity. If we were to write a plain SQL statement to retrieve the data in our CCM's format, it would result in something along the lines of

```sql
  SELECT customer, city, value AS price FROM Sales s, Prices p WHERE s.id = p.saleId
```

Because of that, an `entityMapper` has optional fields `entity2, type, params` that allows the creation of **complex entities**. To create Bob's CCM's only entity, **Sales**, we will use the `addEntity mutation` below. Note that aggregations can be recursevely defined, i.e. you can aggregate more than 2 entities. You can check the [examples folder](https://github.com/yanmendes/polyflow.api/blob/master/examples) for that.

```graphql
mutation addBobSaleEntity {
  addEntity(
    entity: {
      name: "Sales"
      slug: "sales"
      mediatorSlug: "bob"
      entityMapper: {
        entity1: { name: "Sales", alias: "s" }
        entity2: { name: "Prices", alias: "p" }
        columns: [
          { projection: "city", alias: "city" }
          { projection: "customer", alias: "customer" }
          { projection: "value", alias: "price" }
        ]
        type: INNER
        params: ["s.id", "p.saleId"]
      }
    }
  ) {
    id
  }
}
```

Finally, after providing the proper mappings, Bob can query the data using the CCM via the `query` endpoint. As mentioned before, the **mediator's** `slug` provides `polyflow` the proper context to transform incoming queries. Moreover, the slug provided in the **Entity's creation** provides polyflow the `entityMapper` that should be used.

```graphql
query queries {
  query(query: "SELECT * FROM bob[sales]")
}
```

## Running locally

Firstly, you need to set up your environment by installing [Node.js](https://nodejs.org/en/), [PostgreSQL](https://www.postgresql.org/) and [Yarn](https://yarnpkg.com/). If you're running in a Mac distribution, I highly recommend using [Brew](https://brew.sh/) to install and manage your packages.

Now, you need to copy the `.env.sample` file into a `.env` file an write your local settings there.

```sh
$ yarn
$ yarn run build
$ yarn run start:prod
```

## Cleaning up

To stop the execution of the containers, run:

```
  docker rm -f polyflow polyflow-catalog
```

## Future work

- Add support to `group by` and `order by` in the entity mapper

- Export performance metrics from container

## References

- Theoretical fundamentals that guided this work - ÖZSU, M. Tamer; VALDURIEZ, Patrick. Principles of distributed database systems. Springer Science & Business Media, 2011.

- Workflow definition - De Oliveira, Daniel CM, Ji Liu, and Esther Pacitti. "Data-Intensive Workflow Management: For Clouds and Data-Intensive and Scalable Computing Environments." Synthesis Lectures on Data Management 14.4 (2019): 1-179.

- Swift/T WFMS - Wozniak, Justin M., et al. "Swift/t: Large-scale application composition via distributed-memory dataflow processing." 2013 13th IEEE/ACM International Symposium on Cluster, Cloud, and Grid Computing. IEEE, 2013.

- Kepler WFMS - Altintas, Ilkay, et al. "Kepler: an extensible system for design and execution of scientific workflows." Proceedings. 16th International Conference on Scientific and Statistical Database Management, 2004.. IEEE, 2004.
