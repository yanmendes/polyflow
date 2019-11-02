import sqlResolver from './sql'
import bigdawgResolver from './bigdawg'

const contextsRegex = /([a-z-0-9-_]+)\[([a-z-0-9-_]+)\]/gim
const getContexts = (query: string) => contextsRegex.exec(query)

export const getUsedMediators = (queryStmt: string) => {
  let matches
  const res = []

  while ((matches = getContexts(queryStmt))) {
    const [, mediator] = matches
    res.push(mediator)
  }

  return res
}

export { sqlResolver, bigdawgResolver }
