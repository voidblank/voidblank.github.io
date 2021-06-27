import Showdown from 'showdown'

var showdownHighLight = require('showdown-highlight')

/**
 * convert markdown text to html text
 * @param {*} md markdown text
 * @returns html text
 */
function md2html (md) {
  let converter = new Showdown.Converter({
    extensions: [showdownHighLight]
  })
  converter.setOption('tables', true)
  let text = md.toString()
  let html = converter.makeHtml(text)
  return html
}

export default {
  md2html
}
