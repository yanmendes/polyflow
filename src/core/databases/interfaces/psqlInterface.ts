import { Client } from 'pg'
import logger, { categories } from '../../../logger'

const log = logger.child({
  category: categories.DATABASE_INTERFACE
})

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
      .catch(e => {
        log
          .child({
            action: 'query_psql',
            error: e.stack
          })
          .error(`Error while querying PSQL: ${e}`)
        throw e
      })
  }
}

export default psqlInterface
