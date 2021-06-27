/**
 * test obj is an empty or not
 * @param {{}} obj  test obj
 * @returns if obj is an empty Object or not
 */
function isEmpty (obj) {
  if (obj instanceof Object) {
    return Object.keys(obj).length === 0
  }
  return false
}

/**
 * test obj is not an empty Object or not
 * @param {{}} obj test obj
 * @returns if obj is not an empty Object or not
 */
function isNotEmpty (obj) {
  return !isEmpty(obj)
}

export default {
  isEmpty,
  isNotEmpty
}
