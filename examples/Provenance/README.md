In order to foster reproducibility in computational experiment, historical information such as all generated data, the used software and the settings of the execution environment must be made available to other researchers. This type of data is called **Provenance**.

This example builds upon interoperability efforts of the provenance community using the [ProvONE](http://jenkins-1.dataone.org/jenkins/view/Documentation%20Projects/job/ProvONE-Documentation-trunk/ws/provenance/ProvONE/v1/provone.html) data model as a Canonical Conceptual Model to integrate heterogeneous provenance databases [Kepler](https://code.kepler-project.org/code/kepler/trunk/modules/provenance/docs/provenance.pdf) and [Swift](https://ieeexplore.ieee.org/abstract/document/6546066).

To run this experiment you must first [run Polyflow locally](https://github.com/yanmendes/polyflow.api/blob/master/README.md/#running-locally). Once you have built the project and are ready to run it, issue the following command:

```sh
$ yarn run experiment
```

It will launch an special instance of `Polyflow`, in which all logs will be stored in `examples/Provenance/logs`. Unfortunately at this stage, I'm not able to make this benchmark process automatic, so you'll need to manually set up the databases (`dump files` available in this folder), create the entity mappers (they are exported by running `yarn run kepler-entity-model` and `yarn run swift-entity-model`) and issue queries via the `GraphQL playground`, as shown in the [getting started session](https://github.com/yanmendes/polyflow.api/blob/master/README.md/#getting-started).

After running the desired queries, you can run the command below to parse the log files and generate a `csv` file with some performance statistcs.

```sh
$ yarn run process-logs
```
