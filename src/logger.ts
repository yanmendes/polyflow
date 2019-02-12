const prettyPrint = { levelFirst: true, colorize: true, translateTime: true }

export default require('pino')({
  prettyPrint: process.env.NODE_ENV !== 'production' && prettyPrint,
  useLevelLabels: true
})
