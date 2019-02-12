import express from 'express'
import { port } from './config'
import query from './routes/query'
import user from './routes/user'
import bodyParser from 'body-parser'
import path from 'path'
import dotenv from 'dotenv'
import pino from 'express-pino-logger'
import logger from './logger'
import cors from 'cors'

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.join(__dirname, '/../envs/.prod') })
} else {
  dotenv.config({ path: path.join(__dirname, '../../envs/.dev') })
}

const app = express()
app.use(cors())

app.use(pino({ logger }))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => res.status(200).send('ok!'))

app.use('/query', query)
app.use('/', user)

app.listen(port, () => logger.info(`Listening on port ${port}`))
