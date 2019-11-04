import { user } from '../../../repo'
import { handlePossibleUniqueEntryException } from '../../../exceptions'
import logger, { categories } from '../../../logger'

const exceptions = {
  register: 'Email already registered.'
}

const log = logger.child({
  category: categories.USER
})

export default {
  register: (_, { user: { email, password } }) =>
    user
      .insert({ email, password })
      .then(() => 'ok')
      .catch(e => {
        log
          .child({
            error: e,
            action: 'register'
          })
          .error(e.msg)
        throw e
      })
      .catch(handlePossibleUniqueEntryException(exceptions.register))
}
