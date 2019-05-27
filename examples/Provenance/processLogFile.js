const fs = require("fs");
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

  console.log(`
    Request time min: ${Math.min(...requestTime)}ms
    Request time max: ${Math.max(...requestTime)}ms
    Request time avg: ${avg(requestTime)}ms
    Request time stdev: ${stdev(requestTime)}ms
    ==============================
    Database interface min: ${Math.min(...databaseInterface)}ms
    Database interface max: ${Math.max(...databaseInterface)}ms
    Database interface avg: ${avg(databaseInterface)}ms
    Database interface stdev: ${stdev(databaseInterface)}ms
    ==============================
    Overhead min: ${Math.min(...overhead)}ms
    Overhead max: ${Math.max(...overhead)}ms
    Overhead avg: ${avg(overhead)}ms
    Overhead stdev: ${stdev(overhead)}ms
    Overhead avg percentage over requests: ${(avg(overhead) /
      avg(requestTime)) *
      100}%`);

  fs.unlink(file, () => {});
});
