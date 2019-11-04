import { ApolloServer } from 'apollo-server-express'

import typeDefs from './typeDefs'
import resolvers from './resolvers'
import Context from '../types/context.spec'

export default new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }: Context) => ({ req, res }),
  playground: true,
  introspection: true
})
