# polyflow :microscope:

[![CircleCI](https://circleci.com/gh/yanmendes/polyflow/tree/master.svg?style=svg)](https://circleci.com/gh/yanmendes/polyflow/tree/master)
[![codecov](https://codecov.io/gh/yanmendes/polyflow/branch/master/graph/badge.svg)](https://codecov.io/gh/yanmendes/polyflow)

## Description

`polyflow` is a semantic data mediator. Its main goal is to create more accessible data models and democratize data access. Its target users are professionals that use queries as part of their routine but aren't technology experts, such as researchers, product managers and marketing analysts. Consider the following:

Imagine that two researchers, Bob and Alice, share the same research field of study and use computer simulations to assess their work. Simulations are usually structured as **[workflows (Wfs)](#references)** that have **inputs**, a **sequence of programs** that transform them and generate **outputs**. Researchers usually use tools to orchestrate, automate and control their Wfs. They are called [Workflow Management Systems (WFMSs)](#references)

Each WfMS have their **own storing mechanism** and **data model**. They often offer exports structured data (such as logs and Relational Databases (RDbs)) so researchers can query and analyze their findings. However, data exported by different WfMSs may not be compatible for comparison right away since there might be different logical representations (logs vs RDbs) or even different conceptual models (data models). `polyflow` was designed to solve this problem in a very user-friendly way.

Considering that Bob uses [Kepler](https://kepler-project.org/) while Alice uses [Swift/T](http://swift-lang.org/Swift-T/) for orchestrating their respective workflows.

Kepler's and Swift/T's models are similar logical models and semantically identical. Because of that, they can be represented in a **canonical fashion**. In other words, a single **Canonical Conceptual Model (CCM)** can be used to represent data described by both models.

|                 Bob and Alice's model                 |             CCM              |
| :---------------------------------------------------: | :--------------------------: |
| <img height="40%" src="./assets/bob-alice-model.png"> | <img src="./assets/ccm.png"> |

And that's where `polyflow` comes in. Database experts/tech savvy people describe mapping strategies between the CCM and the **local schemas** using an object-like syntax so that researchers can query a single, simplified data model.

Below we show a high-level overview of how `polyflow` works. It transforms queries, during run time, from simple entities to their actual representation in underlying data sources via entity mappers.

<div style='text-align: center;'>
  <img src='assets/Polyflow architecture.png' />
</div>

This software is derived from my master's thesis and you can check the [Publications section](#publications) for aditional information.

# Requirements

All you need [Docker](https://www.docker.com/) to run `polyflow`. To install it, just follow the guide for your OS:

- [MacOS](https://docs.docker.com/docker-for-mac/install/)

* [Windows](https://docs.docker.com/docker-for-windows/install/)

- [Ubuntu](https://phoenixnap.com/kb/how-to-install-docker-on-ubuntu-18-04)

## Running dockerized version

### **⚠️ This guide is valid only to Unix-based distributions. If you have Windows, some commands will be different.**

### **⚠️ If you're running in a Ubuntu distribution, all `docker` commands should be preceded by `sudo`.**

First of all, open the `Terminal` program in your computer. Then, clone or [download](https://github.com/yanmendes/polyflow/archive/master.zip) the repository.

```sh
git clone https://github.com/yanmendes/polyflow
```

If you opted for the download, unzip the file and change into your downloads directory in the `Terminal`. Otherwise, just change into `polyflow's` folder:

```sh
cd polyflow
```

Then, you need to create a docker network to enable communication between containers. To do that, run:

```sh
docker network create polyflow

# if you're running it on a Ubuntu
sudo docker network create polyflow
```

If you have containerized databases that you wish to connect to `polyflow`, make sure to add them to the network.

To run the application just run the command below. It launches two docker containers: one containing the application and other a database that serves as `polyflow's` catalog.

```sh
docker-compose up polyflow

# if you're running it on a Ubuntu
sudo docker-compose up polyflow
```

To make sure your installation worked, open [http://localhost:3050](http://localhost:3050). There should be a blue screen with a big play button in the middle. This is a `GraphQL playground` and where you'll be interacting with polyflow.

### **If you don't know anything about GraphQL, I suggest [this read](https://www.prisma.io/blog/introducing-graphql-playground-f1e0a018f05d) for a quick overview.**

To check out the endpoints of `polyflow`, click the `Schema` button on the right side of the screen. The GraphQL playground provides auto-complete to queries and mutations by tapping `ctrl + space`.

## Core concepts

This section provides an overview of `polyflow's` core concepts and how to interact with the software.

### ⚠️ **This is NOT a valid example and errors will be thrown if you try to execute these queries and mutations. For working examples, check the [examples](#examples) section.**

There are three main concepts in polyflow: `Data Sources`, `Mediators` and `Entities`. In terms of our example, a **data source** is where the resources are located. We currently provide support to PostgreSQL, MySQL and [BigDAWG](https://bigdawg.mit.edu), so a data source is a PSQL/MySQL URL or a BigDAWG endpoint, but you can think of it as an Unique Resource Identifier (URI) to any resource accross the web (e.g. databases, files) that will be mediated by `polyflow`.

To connect `polyflow` to Bob's database, we should use the `addDataSource mutation`.

```graphql
mutation addDataSource {
  addDataSource(
    dataSource: { type: postgres, uri: "<bob's-db-URI>", slug: "bobs-db" }
  ) {
    slug
  }
}
```

To check existing `Data Sources`, you should run the `dataSources query`:

```graphql
query {
  dataSources {
    id
    uri
    type
  }
}
```

**Mediators** are “...a software module that exploits encoded knowledge about certain sets or subsets of data to create information for a higher layer of applications.”. In simpler terms, mediators can be used to enrich data, leveraging domain-specific knowledge to provide simpler and/or more semantically rich data models. Recalling our scenario, mediators would be the transformations needed to convert data described by local (Bob and Alice's) schemas to the global one (**CCM**).

Since the target CCM can have multiple **entities** that compose it, the transformations are described by a more granular abstraction. We can create a `mediator` of a `data source` using the `addMediator mutation`. Note that a `data source` can have multiple mediators. The `mediator's` **slug** will define the mediator being used to handle a query as we'll see further ahead.

```graphql
mutation {
  addMediator(
    mediator: { dataSourceSlug: "bobs-db", name: "Bob's mediator", slug: "bob" }
  ) {
    id
  }
}
```

**Entities** are the most crucial piece of the puzzle. The `entityMapper` prop defines the transformation from this entity's local schema to its global representation. Since `polyflow` aims for a technology-agnostic approach, different data storages can be added by implementing new [interfaces and query resolvers](https://github.com/yanmendes/polyflow.api/tree/master/src/core/databases). With that in mind, note that `entityMappers` structure may vary depending on the data source being used.

For now, `polyflow` only supports a query resolver for SQL and can interface with PostgreSQL, MySQL and BigDawg. The relational's `entityMapper` structure can be [found here](https://github.com/yanmendes/polyflow.api/blob/master/src/types/mediation.ts). It's composed by the table's `name`, a designed (optional) `alias`, the `columns` that will be projected and a `where` prop that applies filters.

However, since the data in our local schema may be more granular than in our CCM, we may need to `aggregate` entities to get the desired outcome. For instance, in Bob's model, the `price` of a sale is not recorded in the `Sales` entity. If we were to write a plain SQL statement to retrieve the data in our CCM's format, it would result in something along the lines of

```sql
SELECT customer, city, value  AS price FROM Sales s, Prices p WHERE s.id = p.saleId

```

Because of that, an `entityMapper` has optional fields `entity2, type, params` that allows the creation of **complex entities**. To create Bob's CCM's only entity, **Sales**, we will use the `addEntity mutation` below. Note that aggregations can be recursively defined, i.e. you can aggregate more than 2 entities. You can check the [examples folder](https://github.com/yanmendes/polyflow.api/blob/master/examples) for that.

```graphql
mutation addBobSaleEntity {
  addEntity(
    entity: {
      name: "Sales"
      slug: "sales"
      mediatorSlug: "bob"
      entityMapper: {
        entity1: { name: "Sales" }
        entity2: { name: "Prices" }
        columns: [
          { projection: "city" }
          { projection: "customer" }
          { projection: "value" }
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

Finally, after providing the proper mappings, Bob can query the data using the CCM via the `query` endpoint. As mentioned before, the `mediator's` **slug** provides `polyflow` the proper context to transform incoming queries. Similarly, the `entity's` **slug** tells `polyflow` which `entityMapper` should be used.

For relational databases, the query syntax is SQL-like, with the only difference being: instead of querying regular tables in your schema, you should be targeting the `entities` inserted in the catalog, wrapped by `[ ]` and preceded by the desired `mediator`, as shown in the example below:

```graphql
query {
  query(query: "SELECT * FROM bob[sales]")
}
```

## Examples

The [examples](./examples) folder contains two implemented examples: one using [PostgreSQL and MySQL databases](./examples/Provenance) and other using [BigDAWG](./examples/BigDawg): a polystore database system. There are `README` files in the directories containing instructions on how to run them.

## Cleaning up

To stop the execution of the containers, run:

```sh
docker rm -f polyflow polyflow-catalog

# if you're running it on a Ubuntu
sudo docker rm -f polyflow polyflow-catalog
```

## Running locally

Firstly, you need to set up your environment by installing [Node.js](https://nodejs.org/en/), [PostgreSQL](https://www.postgresql.org/) and [Yarn](https://yarnpkg.com/). If you're running in a Mac distribution, I highly recommend using [Brew](https://brew.sh/) to install and manage your packages.

Now, you need to copy the `.env.sample` file into a `.env` file an write your local settings there.

```sh
yarn

yarn run build

yarn run start:prod
```

## Known Issues

- Explicit alias is mandatory for tables, i.e. `select * from table t` won't work. It has to be rewritten as `select * from table as t`

## Future work

- Add support to `group by` and `order by` in the entity mapper

## References

- Theoretical fundamentals that guided this work - ÖZSU, M. Tamer; VALDURIEZ, Patrick. Principles of distributed database systems. Springer Science & Business Media, 2011.

* Workflow definition - De Oliveira, Daniel CM, Ji Liu, and Esther Pacitti. "Data-Intensive Workflow Management: For Clouds and Data-Intensive and Scalable Computing Environments." Synthesis Lectures on Data Management 14.4 (2019): 1-179.

- Swift/T WFMS - Wozniak, Justin M., et al. "Swift/t: Large-scale application composition via distributed-memory dataflow processing." 2013 13th IEEE/ACM International Symposium on Cluster, Cloud, and Grid Computing. IEEE, 2013.

* Kepler WFMS - Altintas, Ilkay, et al. "Kepler: an extensible system for design and execution of scientific workflows." Proceedings. 16th International Conference on Scientific and Statistical Database Management, 2004.. IEEE, 2004.

## Publications

- [Polyflow: A SOA for Analyzing Workflow Heterogeneous Provenance Data in Distributed Environments](https://dl.acm.org/citation.cfm?id=3330259)
