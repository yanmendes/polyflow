const createCsvWriter = require('csv-writer').createObjectCsvWriter
const file = process.env.FILE || 'examples/Provenance/logs'

const avg = array => array.reduce((prev, curr) => prev + curr, 0) / array.length

const stdev = array =>
  Math.sqrt(array.reduce((prev, curr) => prev + Math.pow(curr - avg(array), 2), 0))

const lineReader = require('readline').createInterface({
  input: require('fs').createReadStream(file)
})

const logs = []
lineReader.on('line', line => logs.push(JSON.parse(line)))

const logTypes = {
  DBI_LOG: 'database_interface',
  PC_LOG: 'polyflow_core'
}

lineReader.on('close', _ => {
  const polyflowCore = []
  const databaseInterface = []

  for (const log of logs) {
    log.category === logTypes.DBI_LOG && databaseInterface.push(log.duration)
    log.category === logTypes.PC_LOG && polyflowCore.push(log.duration)
  }

  const foldThreshold = databaseInterface.length / polyflowCore.length

  const aggregatedDatabaseTimes = databaseInterface.reduce(
    (prev, curr, i) =>
      i % foldThreshold === 0
        ? [...prev, [curr]]
        : i % foldThreshold === foldThreshold - 1
          ? [
            ...prev.slice(0, prev.length - 1),
            [...prev.pop(), curr].reduce((prev, curr) => Math.max(prev, curr), 0)
          ]
          : [...prev, curr],
    []
  )

  const overhead = polyflowCore.map((val, i) => val - aggregatedDatabaseTimes[i])
  const data = [
    { metric: 'Request time min', value: Math.min(...polyflowCore) },
    { metric: 'Request time max', value: Math.max(...polyflowCore) },
    { metric: 'Request time avg', value: avg(polyflowCore) },
    { metric: 'Request time stdev', value: stdev(polyflowCore) },
    {
      metric: 'Database interface min',
      value: Math.min(...aggregatedDatabaseTimes)
    },
    {
      metric: 'Database interface max',
      value: Math.max(...aggregatedDatabaseTimes)
    },
    { metric: 'Database interface avg', value: avg(aggregatedDatabaseTimes) },
    {
      metric: 'Database interface stdev',
      value: stdev(aggregatedDatabaseTimes)
    },
    { metric: 'Overhead max', value: Math.max(...overhead) },
    { metric: 'Overhead min', value: Math.min(...overhead) },
    { metric: 'Overhead avg', value: avg(overhead) },
    { metric: 'Overhead stdev', value: stdev(overhead) },
    {
      metric: 'Overhead avg percentage over requests',
      value: (avg(polyflowCore) / avg(aggregatedDatabaseTimes) - 1) * 100
    }
  ]

  const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [{ id: 'metric', title: 'Metric' }, { id: 'value', title: 'Value' }]
  })

  csvWriter
    .writeRecords(data)
    .then(() => console.log('The CSV file was written successfully, deleting log file..'))
})
