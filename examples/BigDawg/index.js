const { ApolloClient, gql } = require('apollo-boost')
const fetch = require('node-fetch')
const { HttpLink } = require('apollo-link-http')
const { InMemoryCache } = require('apollo-cache-inmemory')

const keplerEntities = require('./Kepler')
const swiftEntities = require('./Swift')

const polyflowUri = process.env.POLYFLOW_URI || `http://localhost:3050/`
const bigdawgUri = process.env.BIGDAWG_URL || 'http://bigdawg-postgres-catalog:8080/bigdawg/query'

const dataSource = {
  uri: bigdawgUri,
  slug: 'bigdawg',
  type: 'bigdawg'
}

const mediators = [
  {
    dataSourceSlug: 'bigdawg',
    name: 'polyflow-kepler',
    slug: 'kepler'
  },
  {
    dataSourceSlug: 'bigdawg',
    name: 'polyflow-swift',
    slug: 'swift'
  }
]

const addDataSource = gql`
  mutation addDataSource($dataSource: DataSourceInput!) {
    addDataSource(dataSource: $dataSource) {
      slug
    }
  }
`

const addMediator = gql`
  mutation addMediator($mediator: MediatorInput!) {
    addMediator(mediator: $mediator) {
      slug
    }
  }
`

const addEntity = gql`
  mutation addEntity($entity: EntityInput!) {
    addEntity(entity: $entity) {
      slug
    }
  }
`

;(async () => {
  try {
    const client = new ApolloClient({
      link: new HttpLink({
        uri: polyflowUri,
        fetch
      }),
      cache: new InMemoryCache({})
    })

    const mutate = (mutation, variables) =>
      client.mutate({
        mutation,
        variables
      })

    await mutate(addDataSource, { dataSource })
    await Promise.all(mediators.map(mediator => mutate(addMediator, { mediator })))
    await Promise.all(
      keplerEntities.map(e => mutate(addEntity, { entity: { ...e, mediatorSlug: 'kepler' } }))
    )
    await Promise.all(
      swiftEntities.map(e => mutate(addEntity, { entity: { ...e, mediatorSlug: 'swift' } }))
    )
    console.log('Done!')
  } catch (e) {
    console.log({ ...e.graphQLErrors } || e)
    process.exit(2)
  }
})()
