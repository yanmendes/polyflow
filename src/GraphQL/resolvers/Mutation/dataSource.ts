import { getRepository } from 'typeorm'
import { UserInputError } from 'apollo-server-core'

import { getInterface } from '../../../core/databases'
import { DataSource } from '../../../models/polyflow'
import logger, { categories } from '../../../logger'
import { handlePossibleUniqueEntryException } from '../../../exceptions'

const log = logger.child({
  category: categories.DATA_SOURCE
})

export default {
  addDataSource: async (_, { dataSource }) => {
    const dbInterface = getInterface(dataSource.type)
    const validConnection = await dbInterface.assertConnection(dataSource.uri)

    try {
      if (!validConnection) {
        throw new UserInputError("Couldn't connect with the provided URI.")
      }

      return getRepository(DataSource)
        .save({ ...dataSource })
        .catch(handlePossibleUniqueEntryException('URI already registered'))
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
