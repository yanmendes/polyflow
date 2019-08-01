# Running the Provenance example

In order to foster reproducibility in computational experiments, historical information such as all generated data, the used software and the settings of the execution environment must be made available to other researchers. This type of data is called **Provenance**.

This example builds upon interoperability efforts of the provenance community using the [ProvONE](http://jenkins-1.dataone.org/jenkins/view/Documentation%20Projects/job/ProvONE-Documentation-trunk/ws/provenance/ProvONE/v1/provone.html) data model as a Canonical Conceptual Model to integrate heterogeneous provenance databases [Kepler](https://code.kepler-project.org/code/kepler/trunk/modules/provenance/docs/provenance.pdf) and [Swift](https://ieeexplore.ieee.org/abstract/document/6546066).

## Requirements

All you need [Docker](https://www.docker.com/) to run this example. To install it, just see the guide for your OS:

-- [MacOS](https://docs.docker.com/docker-for-mac/install/)

-- [Windows](https://docs.docker.com/docker-for-windows/install/)

-- [Ubuntu](https://phoenixnap.com/kb/how-to-install-docker-on-ubuntu-18-04)

## Running Polyflow and setting up provenance databases

Go back to `Polyflow's` root folder (`cd ../../`), issue the following command to launch an special instance of `Polyflow`, in which all logs will be stored in `examples/Provenance/logs`:

```sh
  docker-compose up experiment
```

Once you have `Polyflow` running, move back to this folder (`cd -`) and run the script below to setup the provenance databases and update `Polyflow`'s catalog.

```sh
  docker-compose up
```

## Queries ran in the experiment

**TODO**

## Getting the results

After running the desired queries, you can enter the docker container and run a script to parse the log files and generate a `.csv` file with some performance statistcs.

```sh
  # Enter the container
  docker exec -it polyflow-experiment /bin/sh
  # Run the script
  node examples/Provenance/processLogFile.js
  # Exit the container
  exit
```

To copy the `.csv` file from the Docker container to your current folder, run:

```sh
  docker cp polyflow-experiment:/usr/src/app/out.csv .
```

## Cleaning up

To stop the execution of the containers, run:

```
  docker rm -f polyflow-experiment polyflow-catalog polyflow-kepler polyflow-swift
```
