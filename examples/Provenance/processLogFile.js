const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const file = process.env.FILE || "examples/Provenance/out";

const avg = array =>
  array.reduce((prev, curr) => prev + curr, 0) / array.length;

const stdev = array =>
  Math.sqrt(
    array.reduce((prev, curr) => prev + Math.pow(curr - avg(array), 2), 0)
  );

fs.readFile(file, "utf8", function(err, contents) {
  if (err) {
    console.log(err);
    process.exit(99);
  }

  const { databaseInterface, requestTime } = contents
    .match(/duration: (\d+)/gm)
    .reduce(
      (prev, current, index) => ({
        databaseInterface:
          index % 2 === 0
            ? [...prev.databaseInterface, parseInt(current.match(/\d+/))]
            : prev.databaseInterface,
        requestTime:
          index % 2 !== 0
            ? [...prev.requestTime, parseInt(current.match(/\d+/))]
            : prev.requestTime
      }),
      {
        databaseInterface: [],
        requestTime: []
      }
    );

  const overhead = requestTime.map((val, i) => val - databaseInterface[i]);

  const data = [
    { metric: "Request time min", value: Math.min(...requestTime) },
    { metric: "Request time max", value: Math.max(...requestTime) },
    { metric: "Request time avg", value: avg(requestTime) },
    { metric: "Request time stdev", value: stdev(requestTime) },
    { metric: "Database interface min", value: Math.min(...databaseInterface) },
    { metric: "Database interface max", value: Math.max(...databaseInterface) },
    { metric: "Database interface avg", value: avg(databaseInterface) },
    { metric: "Database interface stdev", value: stdev(databaseInterface) },
    { metric: "Overhead max", value: Math.max(...overhead) },
    { metric: "Overhead min", value: Math.min(...overhead) },
    { metric: "Overhead avg", value: avg(overhead) },
    { metric: "Overhead stdev", value: stdev(overhead) },
    {
      metric: "Overhead avg percentage over requests",
      value: avg(databaseInterface) / avg(requestTime) * 100 - 1
    }
  ];

  const csvWriter = createCsvWriter({
    path: "out.csv",
    header: [{ id: "metric", title: "Metric" }, { id: "value", title: "Value" }]
  });

  csvWriter
    .writeRecords(data)
    .then(() =>
      console.log("The CSV file was written successfully, deleting log file..")
    )
    .then(() => fs.unlink(file, () => {}));
});
