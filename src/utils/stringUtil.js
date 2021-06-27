/**
 * converter string to title string
 * @param {string} origin origin string
 * @returns title string
 */
function toTitle (origin) {
  if (origin === undefined || origin === null) {
    return origin
  }
  let str = origin[0].toUpperCase()
  let isLastCharSpace = false
  for (let i = 1; i < origin.length; i++) {
    if (isLastCharSpace) {
      isLastCharSpace = false
      str += origin[i].toUpperCase()
      continue
    }
    if (origin[i] === ' ') {
      isLastCharSpace = true
    }
    str += origin[i]
  }
  return str
}

/**
 * converter markdown title message to json
 * @param {string} origin origin markdown title string
 * @returns json message
 */
function mdTitle2Msg (origin) {
  if (origin === undefined || origin === null) {
    return {}
  }
  let msg = {}
  let x = 0
  let lastKey = ''
  let newLine = true
  for (let i = 0; i < origin.length; i++) {
    if (origin[i] === ':' && newLine) {
      lastKey = origin.substring(x, i)
      newLine = false
      x = i + 1
    }
    if (origin[i] === '\n') {
      msg[lastKey] = origin.substring(x, i).trim()
      newLine = true
      x = i + 1
    }
  }
  return msg
}

export default {
  toTitle,
  mdTitle2Msg
}
