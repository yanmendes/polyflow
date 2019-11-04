import { sign } from 'jsonwebtoken'

import { user } from '../../../repo'
import {
  handlePossibleUniqueEntryException,
  handlePossibleInvalidEmailOrPassword
} from '../../../exceptions'
import logger, { categories } from '../../../logger'
import { JWT_SECRET } from '../../../config'
import Context from '../../../types/context.spec'

const exceptions = {
  register: 'Email already registered.',
  login: 'User/password invalid'
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
      .catch(handlePossibleUniqueEntryException(exceptions.register)),

  login: (_, { user: { email, password } }, { res }: Context) =>
    user
      .authenticate({ email, password })
      .then(auth => !auth && Promise.reject(new Error('Invalid password')))
      .then(_ => sign({ email }, JWT_SECRET, { expiresIn: '7d' }))
      .then(token =>
        res.cookie('auth-cookie', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        })
      )
      .then(() => 'ok')
      .catch(e => {
        log
          .child({
            error: e,
            action: 'login'
          })
          .error(e)
        throw e
      })
      .catch(handlePossibleInvalidEmailOrPassword(exceptions.login))
}
