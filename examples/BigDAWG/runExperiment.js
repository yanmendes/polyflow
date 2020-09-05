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

const Q1 = gql`
  query Q1 {
    query(query: "bdrel(select * from kepler[provone_port])")
  }
`

const Q2 = gql`
  query Q2 {
    query(
      query: "bdrel(select * from swift[provone_execution] as e join swift[prov_wasGeneratedBy] as wgb on e.swift_execution_id = wgb.swift_execution_id)"
    )
  }
`

const Q3 = gql`
  query Q3 {
    query(
      query: "bdrel(select * from kepler[prov_usage] as u inner join kepler[provone_port] as p on u.kepler_provone_hadInPort = p.kepler_port_id)"
    )
  }
`

const Q4 = gql`
  query Q4 {
    query(
      query: "bdrel(select * from kepler[provone_port] left join (select * from swift[provone_program]) as programs on 1=1)"
    )
  }
`

const Q5 = gql`
  query Q5 {
    query(
      query: "bdrel(select * from (select duration from swift[provone_execution]) as t1 left join (select EXTRACT(SECOND FROM kepler_prov_endedAtTime - kepler_prov_startedAtTime) from kepler[provone_execution]) as t2 on 1=1)"
    )
  }
`

const Q6 = gql`
  query Q6 {
    query(
      query: "bdrel(select * from kepler[provone_execution] as e inner join kepler[provone_program] as p on p.kepler_program_id = e.kepler_provone_hadPlan left join swift[provone_program] as sp on 1=1 left join swift[provone_execution] as se on se.swift_provone_hadPlan = sp.swift_program_id)"
    )
  }
`

;(async () => {
  const _1sec = 1000
  try {
    for (i of Array(REPETITIONS)) {
      await delay(q(Q1), _1sec)
    }
    for (i of Array(REPETITIONS)) {
      await delay(q(Q2), _1sec)
    }
    for (i of Array(REPETITIONS)) {
      await delay(q(Q3), _1sec)
    }
    for (i of Array(REPETITIONS)) {
      await delay(q(Q4), _1sec)
    }
    for (i of Array(REPETITIONS)) {
      await delay(q(Q5), _1sec)
    }
    for (i of Array(REPETITIONS)) {
      await delay(q(Q6), _1sec)
    }
    console.log('Done!')
  } catch (e) {
    console.error(e)
    return process.exit(2)
  }
})()

exports.REPETITIONS = REPETITIONS
