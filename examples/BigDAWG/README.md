# Running the BigDAWG example

First, we're gonna download BigDAWG. [This fork](https://github.com/yanmendes/bigdawg) provides some scripts we'll be using in this tutorial.

## Requirements

### ⚠️To run the following example, I'm assuming you're using an Unix-based distribution (MacOS or Linux). If you're using a Windows machine, some commands may change.

All you need [Docker](https://www.docker.com/) to run this example. To install it, just see the guide for your OS:

- [MacOS](https://docs.docker.com/docker-for-mac/install/)

- [Windows](https://docs.docker.com/docker-for-windows/install/)

- [Ubuntu](https://phoenixnap.com/kb/how-to-install-docker-on-ubuntu-18-04)

## Installing BigDAWG with provenance data

First of all, open the `Terminal` program in your computer. Then, clone or [download](https://github.com/yanmendes/bigdawg/archive/master.zip) the repository.

```sh
  git clone https://github.com/yanmendes/bigdawg
```

If you opted for the download, unzip the file and change into your downloads directory in the `Terminal`. Run the script below.

### ⚠️ It usually takes a couple of minutes. You'll notice it's finished when the the last line says `Hit enter to stop it...`.

```sh
  cd bigdawg/provisions && ./setup_polyflow.sh
```

The script starts three Docker containers named `bigdawg-postgres-swift`, `bigdawg-postgres-kepler` and `bigdawg-postgres-catalog`. The first two are relational databases with [provenance data](../Provenance) and the last one is BigDAWG's modified catalog containing `Kepler's` and `Swift's` schema details. To see if your installation was successful, run the following query:

```sh
  curl -X POST -d "bdrel(select * from data);" http://localhost:8080/bigdawg/query/
```

The expected output is:

```
  contents        truncated       md5
  [B@760bf73d     true            3efa76b06a6ecf6b51f45e43fc9d5d53
```

## Connecting polyflow to BigDAWG

If you don't have `polyflow` up and running, you should follow [this guide](https://github.com/yanmendes/polyflow#running-dockerized-version) first.

Once you have `polyflow` running, open a new shell tab in your `Terminal` (`cmd⌘ + t` or `ctrl + t`), move to this folder (`cd <polyflow-dir-location>/examples/BigDAWG`) and run the script below to automatically:

- Insert BigDAWG as a `data source`;
- Create mediators;
- Insert [Kepler's](./Kepler) and [Swift's](./Swift) entity mappers into `polyflow's` catalog.

If you have BigDAWG OR `polyflow` installed elsewhere, create a new [.env from the template](./.env.sample) file and [override the env_file setting in your `docker-compose`](./docker-compose.yml#L4).

```sh
docker-compose up setup-bigdawg

# if you're running it on a Ubuntu
sudo docker-compose up setup-bigdawg
```

If everything went well, you should see a `Done!` message in your shell. To make sure everything is working, connect to `polyflow` (the default URL is [http://localhost:3050/](http://localhost:3050/)) and run the following query on the playground:

```graphql
query query {
  query(query: "bdrel(select * from kepler[provone_port])")
}
```

The expected output is:

```json
{
  "data": {
    "query": [
      {
        "id": "22",
        "case": "out",
        "name": ".Constant.output"
      },
      {
        "id": "23",
        "case": "in",
        "name": ".Constant.trigger"
      },
      {
        "id": "30",
        "case": "in",
        "name": ".Display.input"
      }
    ]
  }
}
```

Now you have a running instance of `polyflow` connected to BigDAWG and populated with provenance data. The next section describes the setup to assess the results for queries run in the experiment.

## Installing a SQL IDE

To assess the results of queries, you can use a SQL IDE of your preference and query the raw data directly. If you don't have one, we suggest using SQLPad, since it's browser-based and simple to install since it's already bundled in docker-compose.

### **⚠️ If you already have a SQL IDE, you can skip to [this section](#connecting-raw-databases)**

All you need to install SQLPad is run the script below. **Remember to use the `-d` flag, so you don't lock-in your terminal with unnecessary logs**

```sh
docker-compose up -d sqlpad

# if you're running it on a Ubuntu
sudo docker-compose up -d sqlpad
```

Once it's done, open [http://localhost:5000](http://localhost:5000) on your browser and click [`Sign up`](http://localhost:5000/signup). You can enter any email and password you like. Finally, [`Sign in`](http://localhost:5000/signin) with your credentials. You should see a big white screen with an action bar at the top.

## Connecting raw databases

To add a database in SQLPad, you should click `...New connection` on the navigation bar on the top of the page. Once you do, name your connection (I suggest using `Kepler`, but you can write anything); Then choose `Postgres` driver. Finally, fill in the following fields:

- `Host/Server/IP Address`: `bigdawg-postgres-kepler`
- `Port (optional)`: `5401`
- `Database`: `kepler`
- `Database username`: `postgres`

Now, scroll down and click on `Test`. It should show a green check mark. `Save` your changes. Repeat the process for `Swift`. `...New connection`, name it, choose the `Postgres` driver and write the connection details:

- `Host/Server/IP Address`: `bigdawg-postgres-swift`
- `Port (optional)`: `5402`
- `Database`: `swift`
- `Database username`: `postgres`

### **⚠️ If you are using a SQL editor in your own computer, note that the `Host` will change, since it's not in the docker network. You should use `localhost` instead.**

## Queries ran in the experiment

Queries defined in Section 2 of [this paper](https://link.springer.com/chapter/10.1007/978-3-319-40593-3_5):

- **Q1**: Retrieve all programs with their input and output ports for Swift's provenance graph:

```graphql
query Q1 {
  query(
    query: "bdrel(select * from kepler[provone_program] as pr join kepler[provone_port] as p on p.port_id = pr.program_id)"
  )
}
```

- **Q2**: Retrieve all activity executions with their generated data for Swift's provenance graph:

```graphql
query Q2 {
  query(
    query: "bdrel(select * from swift[provone_execution] as e join swift[prov_wasGeneratedBy] as wgb on e.execution_id = wgb.execution_id)"
  )
}
```

- **Q3**: Retrieve the time consumed by each activity execution for Kepler's provenance graph

```graphql
# This query is broken. Fault: BigDAWG
query Q3 {
  query(
    query: "bdrel(select prov_endedAtTime - prov_endedAtTime AS duration from kepler[provone_execution])"
  )
}
```

- **Q4**: Retrieve the complete activity execution trace that influenced the generation of the data d′

```graphql
query Q4 {
  query(
    query: "bdrel(select * from swift[prov_wasGeneratedBy] as wgb join swift[provone_execution] as e on e.execution_id = wgb.execution_id join swift[prov_entity] as ent on ent.entity_id = wgb.entity_id)"
  )
}
```

- **Q9**: Retrieve the complete activity execution trace that influenced the generation of the data d′

```graphql
query Q9 {
  query(
    query: "bdrel(select * from swift[prov_wasGeneratedBy] as wgb join swift[provone_execution] as e on e.execution_id = wgb.execution_id join swift[prov_entity] as ent on ent.entity_id = wgb.entity_id)"
  )
}
```

## Cleaning up

To stop the execution of the containers, run:

```sh
docker rm -f polyflow polyflow-catalog bigdawg-postgres-catalog bigdawg-postgres-swift bigdawg-postgres-kepler

# if you're running it on a Ubuntu
sudo docker rm -f polyflow polyflow-catalog bigdawg-postgres-catalog bigdawg-postgres-swift bigdawg-postgres-kepler
```

## Adding your own data

To add your own data, refer to the [core concepts section](https://github.com/yanmendes/polyflow#core-concepts)
