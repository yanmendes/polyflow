const createCsvWriter = require('csv-writer').createObjectCsvWriter
const file = process.env.FILE || './logs'
const { REPETITIONS } = require('./runExperiment')

const avg = array => array.reduce((prev, curr) => prev + curr, 0) / array.length

const stdev = array =>
  Math.sqrt(
    array.reduce((prev, curr) => prev + Math.pow(curr - avg(array), 2), 0)
  )

const lineReader = require('readline').createInterface({
  input: require('fs').createReadStream(file)
})

const logs = []
lineReader.on('line', line => logs.push(JSON.parse(line)))

const logTypes = {
  DBI_LOG: 'database_interface',
  PC_LOG: 'polyflow_core'
}

function split (array, n) {
  const [...arr] = array
  var res = []
  while (arr.length) {
    res.push(arr.splice(0, n))
  }
  return res
}

lineReader.on('close', async _ => {
  const polyflowCore = []
  const databaseInterface = []

  for (const log of logs) {
    log.category === logTypes.DBI_LOG && databaseInterface.push(log.duration)
    log.category === logTypes.PC_LOG && polyflowCore.push(log.duration)
  }

  const polyflowCoreSubArrays = split(polyflowCore, REPETITIONS)
  const databaseInterfaceSubArrays = split(databaseInterface, REPETITIONS)

  const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
      { id: 'metric', title: 'Metric' },
      { id: 'value', title: 'Value' },
      { id: 'experiment', title: 'Experiment' }
    ]
  })

  for (const experiment in polyflowCoreSubArrays) {
    const aggregatedDatabaseTimes = databaseInterfaceSubArrays[experiment]

    const overhead = polyflowCoreSubArrays[experiment].map(
      (val, i) => val - aggregatedDatabaseTimes[i]
    )
    const data = [
      {
        metric: 'Request time min',
        value: Math.min(...polyflowCoreSubArrays[experiment]),
        experiment
      },
      {
        metric: 'Request time max',
        value: Math.max(...polyflowCoreSubArrays[experiment]),
        experiment
      },
      {
        metric: 'Request time avg',
        value: avg(polyflowCoreSubArrays[experiment]),
        experiment
      },
      {
        metric: 'Request time stdev',
        value: stdev(polyflowCoreSubArrays[experiment]),
        experiment
      },
      {
        metric: 'Database interface min',
        value: Math.min(...aggregatedDatabaseTimes),
        experiment
      },
      {
        metric: 'Database interface max',
        value: Math.max(...aggregatedDatabaseTimes),
        experiment
      },
      {
        metric: 'Database interface avg',
        value: avg(aggregatedDatabaseTimes),
        experiment
      },
      {
        metric: 'Database interface stdev',
        value: stdev(aggregatedDatabaseTimes),
        experiment
      },
      { metric: 'Overhead max', value: Math.max(...overhead), experiment },
      { metric: 'Overhead min', value: Math.min(...overhead), experiment },
      { metric: 'Overhead avg', value: avg(overhead), experiment },
      { metric: 'Overhead stdev', value: stdev(overhead), experiment },
      {
        metric: 'Overhead avg percentage over requests',
        value:
          (avg(polyflowCoreSubArrays[experiment]) /
            avg(aggregatedDatabaseTimes) -
            1) *
          100,
        experiment
      }
    ]

    await csvWriter
      .writeRecords(data)
      .then(() => console.log(`Experiment ${experiment} Done`))
  }
})
