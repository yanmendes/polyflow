import _ from 'lodash'

export default (object: any, allowed: Array<any>): Object => (_.pick(object, allowed))
