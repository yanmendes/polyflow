import dataSourceMutations from './dataSource'
import mediatorMutations from './mediator'
import entityMutations from './entity'
import userMutations from './user'

export default {
  ...userMutations,
  ...dataSourceMutations,
  ...mediatorMutations,
  ...entityMutations
}
