export default (object, allowed) => (
  Object.keys(object)
    .filter(key => allowed.includes(key))
    .reduce((obj, key) => {
      obj[key] = object[key]
      return obj
    }, {})
)
