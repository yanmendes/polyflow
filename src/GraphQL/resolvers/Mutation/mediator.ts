import { getRepository } from 'typeorm'
import { UserInputError } from 'apollo-server-core'

import { Mediator, DataSource } from '../../../models'
import logger, { categories } from '../../../logger'
import { handlePossibleUniqueEntryException } from '../../../exceptions'

const log = logger.child({
  category: categories.MEDIATOR
})
const msg = 'Mediator Name/slug already in use for data source.'

export default {
  addMediator: async (_, { mediator: { dataSourceSlug, ...mediator } }) => {
    const dataSource = await DataSource.findOne({
      where: { slug: dataSourceSlug }
    })

    try {
      if (!dataSource) {
        throw new UserInputError(
          `No data sources found with slug ${dataSourceSlug}`
        )
      }

      return getRepository(Mediator)
        .save({ ...mediator, dataSource })
        .catch(handlePossibleUniqueEntryException(msg))
    } catch (e) {
      log
        .child({
          error: e,
          action: 'adding_mediator'
        })
        .error(e)

      throw e
    }
  }
}
