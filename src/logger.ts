const prettyPrint = { levelFirst: true, colorize: true, translateTime: true }

const destination =
  process.env.NODE_ENV === 'test'
    ? require('fs').createWriteStream('/dev/null')
    : process.stdout
export default require('pino')(
  {
    prettyPrint: process.env.NODE_ENV !== 'production' && prettyPrint,
    useLevelLabels: true
  },
  process.env.LOGFILE,
  destination
)

export const categories = {
  DATA_SOURCE: 'data_source',
  MEDIATOR: 'mediator',
  ENTITY: 'entity',
  POLYFLOW_CORE: 'polyflow_core',
  DATABASE_INTERFACE: 'database_interface'
}
