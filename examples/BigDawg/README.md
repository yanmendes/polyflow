# Running the BigDAWG example

First, we're gonna download BigDAWG. Unfortunatelly, there are some unresolved bugs in the
[official repository](https://github.com/bigdawg-istc/bigdawg). [This fork](https://github.com/yanmendes/bigdawg) provides some work-arounds for these bugs and scripts we'll be using in this tutorial.

## Requirements

To run the following example, I'm assuming you're using an Unix-based distribution (MacOS or Linux). If you're using a Windows machine, some commands may change.

All you need [Docker](https://www.docker.com/) to run this example. To install it, just see the guide for your OS:

- [MacOS](https://docs.docker.com/docker-for-mac/install/)

- [Windows](https://docs.docker.com/docker-for-windows/install/)

- [Ubuntu](https://phoenixnap.com/kb/how-to-install-docker-on-ubuntu-18-04)

## Installing BigDAWG with provenance data

First of all, clone or download the repository the repository:

```sh
  git clone https://github.com/yanmendes/bigdawg
```

Change into the provisions folder and run the script. It usually takes a couple of minutes. You'll now it's finished when the the last line says `Hit enter to stop it...`. Notice that some errors may occur during the process, but just ignore them if you can reproduce all the steps in this tutorial. They are related to SciDB, but this database is not used in this example.

```sh
  cd bigdawg/provisions && bash setup_polyflow.sh
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

If you don't have `polyflow` up and running, you should follow [this guide](https://github.com/yanmendes/polyflow#running-dockerized-version).

Once you have `polyflow` running, open a new shell tab, move to this folder (`cd <polyflow>/examples/BigDawg`) and run the script below to automatically:

- Insert BigDAWG as a `data source`;
- Create mediators; 
- Insert [Kepler's](./Kepler) and [Swift's](./Swift) entity mappers into `polyflow's` catalog. 

If you have BigDAWG or `polyflow` installed elsewhere, just create a new [.env from the template](./.env.sample) file and [override the env_file setting](./docker-compose.yml).

```sh
  docker-compose up
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

Now you have a running instance of `polyflow` connected to BigDAWG and populated with provenance data. The next section describes the queries run in the experiment.

## Queries ran in the experiment

_TODO_

## Cleaning up

To stop the execution of the containers, run:

```sh
  docker rm -f polyflow polyflow-catalog bigdawg-postgres-catalog bigdawg-postgres-swift bigdawg-postgres-kepler
```
