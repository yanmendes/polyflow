import fetch from 'node-fetch'
import logger, { categories } from '../../../logger'

const log = logger.child({
  category: categories.DATABASE_INTERFACE,
  interface: 'bigdawg'
})

const bigdawgInterface = {
  assertConnection: url =>
    fetch(url, {
      method: 'post',
      body: 'bdcatalog(SELECT * FROM catalog.engines)'
    })
      .then(_ => true)
      .catch(e =>
        log
          .child({
            action: 'asserting connection',
            error: e.stack || e
          })
          .error('Something went wrong while asserting the connection')
      ),

  query: async (url: string, query: string) => {
    if (!query) {
      throw new Error('No query issued to this interface')
    }

    return fetch(url, {
      method: 'post',
      body: query
    })
      .then(res => res.text())
      .then(parseResponseToJSON)
      .catch(e => {
        log
          .child({
            action: 'resolving query',
            error: e.stack || e,
            query
          })
          .error(
            'Something went wrong while submiting a query to this interface'
          )
        throw e
      })
  }
}

const parseResponseToJSON = (results: string) => {
  if (!results) return {}
  if (results.split('\n').length === 1) throw new Error(results)
  const [firstRow, ...rest] = results.split('\n')
  const dimensions = firstRow.split('\t')
  const instances = rest.map(instance => instance.split('\t'))

  return instances
    .map(instance =>
      instance
        .filter(i => !!i.length)
        .reduce(
          (aggr, curr, index) => ({ ...aggr, [dimensions[index]]: curr }),
          {}
        )
    )
    .filter(i => Object.keys(i).length !== 0)
}

export default bigdawgInterface
