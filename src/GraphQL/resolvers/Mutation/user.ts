import { hash } from 'bcrypt'
import { getRepository } from 'typeorm'

import { User } from '../../../models/polyflow'
import { handlePossibleUniqueEntryException } from '../../../exceptions'

const msg = 'Email already registered.'
const saltRounds = 10

export default {
  register: (_, { user: { email, password } }) =>
    hash(password, saltRounds)
      .then(password => getRepository(User).save({ email, password }))
      .then(() => 'ok')
      .catch(handlePossibleUniqueEntryException(msg))
}
