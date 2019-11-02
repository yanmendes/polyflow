import typeDefs from './typeDefs'
import resolvers from './resolvers'
import { ApolloServer } from 'apollo-server-express'

export default new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }: any) => ({ req, res }),
  playground: true,
  introspection: true
})
