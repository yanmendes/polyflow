# Running the BigDawg example

First, we're gonna download BigDawg. Unfortunatelly, there are some unresolved bugs in the
[official repository](https://github.com/bigdawg-istc/bigdawg). [This fork](https://github.com/yanmendes/bigdawg) provides some work-arounds for these bugs and scripts we'll be using in this tutorial.

# Requirements

To run the following example, I'm assuming you're using an Unix-based distribution (MacOS or Linux). If you're using a Windows machine, some commands may change.

All you need [Docker](https://www.docker.com/) to run this example. To install it, just see the guide for your OS: 

- [MacOS](https://docs.docker.com/docker-for-mac/install/)

- [Windows](https://docs.docker.com/docker-for-windows/install/)

- [Ubuntu](https://phoenixnap.com/kb/how-to-install-docker-on-ubuntu-18-04)

# Installing BigDAWG with provenance data

First of all, let's clone the repository:

```git
  git clone https://github.com/yanmendes/bigdawg
```

Just change into the provisions folder and run the script. It usually takes a couple of minutes. You'll now it's finished when the the last line says `Hit enter to stop it...`. Notice that some errors may occur during the process, but just ignore them if you can reproduce all the steps in this tutorial. They are related to SciDB, but this database is not used in this example.

```sh
  cd bigdawg/provisions && bash setup_polyflow.sh
```

The script starts three Docker containers named `bigdawg-postgres-swift`, `bigdawg-postgres-kepler` and `bigdawg-postgres-catalog`. The first two are relational databases with [provenance data](../Provenance) and the last one is BigDAWG's modified catalog with our data. To see if your installation was successful, run the following query:

```sh
  curl -X POST -d "bdrel(select * from data);" http://localhost:8080/bigdawg/query/
```

The expected output is:
```
  contents        truncated       md5
  [B@760bf73d     true            3efa76b06a6ecf6b51f45e43fc9d5d53
```

Now, just add a new `Data Source` with the URL `http://localhost:8080/bigdawg/query/` to Polylflow's catalog, as shown in the [getting started guide](../../README.md)

# Queries ran in the experiment

*TODO*

# Cleaning up

To stop the execution of the containers, run:

```
  docker rm -f $(docker ps -aq)
```
