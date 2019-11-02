import { Client } from 'pg'
import logger from '../../../logger'

const psqlInterface = {
  assertConnection: url =>
    Promise.resolve()
      .then(_ => new Client({ connectionString: url }))
      .then(client => client.connect().then(() => client.end()))
      .then(_ => true)
      .catch(_ => false),

  query: async (url: string, query: string) => {
    if (!query) {
      throw new Error('No query issued to this interface')
    }

    const client = new Client({ connectionString: url })
    return client
      .connect()
      .then(() => client.query(query))
      .then(res => client.end().then(() => res.rows))
      .catch(e => logger.error(e) || e)
  }
}

export default psqlInterface
