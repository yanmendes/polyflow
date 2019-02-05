'use strict'

const { Client } = require('pg')

export default async (query, callback) => {
  const client = new Client()
  await client.connect()

  if (!query) {
    throw new Error('No query issued to this interface')
  }

  client.query(query, async (err, res) => {
    if (err) { throw err }

    await client.end()

    callback(res.rows)
  })
}
