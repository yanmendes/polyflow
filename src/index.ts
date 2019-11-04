import 'reflect-metadata'
import 'dotenv/config'
import * as express from 'express'
import * as pino from 'express-pino-logger'
import { createConnection } from 'typeorm'
import * as cookieParser from 'cookie-parser'

import { port, psqlURL } from './config'
import logger from './logger'
import server from './GraphQL'

const startServer = async () => {
  await createConnection({
    entities: [
      process.env.NODE_ENV === 'production'
        ? 'dist/models/**/*.js'
        : 'src/models/**/*.ts'
    ],
    synchronize: true,
    url: psqlURL,
    type: 'postgres'
  })

  const app = express()

  app.use(cookieParser())
  app.use(pino({ logger }))

  server.applyMiddleware({
    path: '/',
    app,
    cors: {
      credentials: true,
      origin: '*'
    }
  })

  app.listen({ port }, () => console.log(`Server ready. Lestining on ${port}`))
}

startServer().catch(e => logger.error(e))
