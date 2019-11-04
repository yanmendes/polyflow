import { hash, compare } from 'bcrypt'
import { getRepository } from 'typeorm'

import { User } from '../models'

const saltRounds = 10

export default {
  insert ({ email, password }) {
    return hash(password, saltRounds).then(password =>
      getRepository(User).save({ email, password })
    )
  },

  authenticate ({ email, password: inputPw }) {
    return User.findOne({ where: { email } })
      .then(u => (!u ? Promise.reject(new Error('Invalid email')) : u))
      .then(({ password }) => compare(inputPw, password))
  }
}
