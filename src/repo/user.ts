import { hash, compare } from 'bcrypt'
import { getRepository } from 'typeorm'

import { User } from '../models'

const saltRounds = 10

export default {
  insert({ email, password }) {
    return hash(password, saltRounds)
        .then(password => getRepository(User).save({ email, password }))
  }
}
