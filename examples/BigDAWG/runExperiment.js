const fetch = require('node-fetch')
const qs = require('querystring')
const gql = require('tagged-template-noop')

const REPETITIONS = 10
const polyflowUri = process.env.POLYFLOW_URI || 'http://localhost:3050/'

const q = query =>
  fetch(`${polyflowUri}/graphql?${qs.stringify({ query })}`).then(
    f => f.json().statusCode
  )
const delay = (p, ms) =>
  new Promise(resolve => setTimeout(() => resolve(p), ms))

const keplerPorts = gql`
  query Q1 {
    query(query: "bdrel(select * from kepler[provone_port])")
  }
`

const swiftExecutionsAndOutputs = gql`
  query Q2 {
    query(
      query: "bdrel(select * from swift[provone_execution] as e join swift[prov_wasGeneratedBy] as wgb on e.execution_id = wgb.execution_id)"
    )
  }
`

const crossDBQuery = gql`
  query Q3 {
    query(
      query: "bdrel(select * from kepler[provone_port] left join (select * from swift[provone_program]) as programs on 1=1)"
    )
  }
`

;(async () => {
  const _1sec = 1000
  try {
    for (i of Array(REPETITIONS)) {
      await delay(q(keplerPorts), _1sec)
    }
    for (i of Array(REPETITIONS)) {
      await delay(q(swiftExecutionsAndOutputs), _1sec)
    }
    for (i of Array(REPETITIONS)) {
      await delay(q(crossDBQuery), _1sec)
    }
    console.log('Done!')
  } catch (e) {
    console.error(e)
    return process.exit(2)
  }
})()

exports.REPETITIONS = REPETITIONS
