import { getRepository } from 'typeorm'
import { UserInputError } from 'apollo-server-core'

import { Entity, Mediator } from '../../../models/polyflow'
import logger, { categories } from '../../../logger'
import { handlePossibleUniqueEntryException } from '../../../exceptions'

const log = logger.child({
  category: categories.ENTITY
})
const msg = 'Entity name/slug already in use for mediator.'

export default {
  addEntity: async (_, { entity: { mediatorSlug, ...entity } }) =>
    Mediator.findOne({ where: { slug: mediatorSlug } })
      .then(mediator =>
        !mediator
          ? Promise.reject(
              new UserInputError(`No mediators found with slug ${mediatorSlug}`)
            )
          : getRepository(Entity)
              .save({ ...entity, mediator })
              .catch(handlePossibleUniqueEntryException(msg))
      )
      .catch(e => {
        log
          .child({
            error: e,
            action: 'adding_entity'
          })
          .error(e.msg)

        throw e
      })
}
