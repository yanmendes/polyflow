const { ApolloClient, gql } = require('apollo-boost')
const fetch = require('node-fetch')
const { HttpLink } = require('apollo-link-http')
const { InMemoryCache } = require('apollo-cache-inmemory')

const keplerEntities = require('./Kepler')
const swiftEntities = require('./Swift')

const polyflowUri = process.env.POLYFLOW_URI || `http://localhost:3050/`
const keplerUri = process.env.KEPLER_URL || 'postgres://postgres@polyflow-kepler/kepler'
const swiftUri = process.env.SWIFT_URL || 'postgres://postgres@polyflow-swift/swift'

const dataSources = [
  {
    uri: keplerUri,
    slug: 'kepler',
    type: 'postgres'
  },
  {
    uri: swiftUri,
    slug: 'swift',
    type: 'postgres'
  }
]

const mediators = [
  {
    dataSourceSlug: 'swift',
    name: 'swift',
    slug: 'swift'
  },
  {
    dataSourceSlug: 'kepler',
    name: 'kepler',
    slug: 'kepler'
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

    const createEntity = mediatorSlug => e => mutate(addEntity, { entity: { ...e, mediatorSlug } })

    await Promise.all(dataSources.map(dataSource => mutate(addDataSource, { dataSource })))
    await Promise.all(mediators.map(mediator => mutate(addMediator, { mediator })))
    await Promise.all(keplerEntities.map(createEntity('kepler')))
    await Promise.all(swiftEntities.map(createEntity('swift')))
    console.log('Done updating the catalog!')
    console.log('===DO NOT KILL THIS TERMINAL!===')
    console.log('===the provenance databases are hosted here!===')
  } catch (e) {
    console.log(e.graphQLErrors)
    console.log(e.stack)
    process.exit(2)
  }
})()
