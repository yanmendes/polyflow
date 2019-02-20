import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as session from 'express-session'
import * as path from 'path'
import * as dotenv from 'dotenv'
import * as pino from 'express-pino-logger'
import { createConnection } from 'typeorm'

import { port } from './config'
import logger from './logger'
import query from './routes/query'
import user from './routes/user'
import typeDefs from './types/GraphQLTypes'
import resolvers from './resolvers'

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.join(__dirname, '/../envs/.prod') })
} else {
  dotenv.config({ path: path.join(__dirname, '../../envs/.dev') })
}

const startServer = async () => {

  await createConnection()

  const app = express()
  app.use(cors())

  app.use(pino({ logger }))

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  app.get('/', (_, res) => res.status(200).send('ok!'))

  app.use('/query', query)
  app.use('/user', user)

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }: any) => ({ req, res })
  })

  app.use(
    session({
      secret: 'i5n31io13ip5h1p',
      resave: false,
      saveUninitialized: false
    })
  )

  server.applyMiddleware({ app })

  app.listen({ port }, () =>
    console.log(`Server ready. Lestining on ${port}`)
  )
}

startServer()
