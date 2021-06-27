import moment from 'moment'
import arrayUtil from '../../utils/arrayUtil'
import stringUtil from '../../utils/stringUtil'

const md = {
  namespace: true,
  state () {
    return {
      fileList: [],
      category: {},
      tag: {},
      labelDays: [],
      isReadOver: false
    }
  },
  getters: {
    getUrlByCategoryAndTitle: (state) => (payload) => {
      const category = payload.category
      const title = payload.title
      for (const i of state.fileList) {
        if (i.category === category && i.routePath === title) {
          return i
        }
      }
      return undefined
    },
    getFileList: (state) => state.fileList
  },
  actions: {
    getFiles ({ state, commit }) {
      state.fileList = []
      state.category = {}
      state.tag = {}
      state.labelDays = []
      const files = require.context('@/assets/posts', true, /\.js$/)
      let total = 0
      let cnt = 0
      files.keys().forEach(e => {
        total++
        // 获取文件目录及名称
        const listItemS = e.substr(1).split('/')
        if (listItemS.length > 0) {
          import('@/assets/posts' + e.substr(1)).then(response => {
            const listObj = getFileListItem(e, response)
            // 获取文件内部存储的信息,如作者、tag等
            const tags = listObj.message.tags.substring(1, listObj.message.tags.length - 1).split(', ')
            updateLabelDays(state.labelDays, listObj)
            state.fileList.push(listObj)
            // 将文件存到catrgory中
            !state.category[listObj.category] && (state.category[listObj.category] = [])
            const categoryItem = {
              title: listObj.title,
              date: listObj.modifyDate,
              path: listObj.routePath
            }
            state.category[listObj.category].push(categoryItem)
            tags.forEach(t => {
              if (!state.tag[t]) {
                state.tag[t] = []
              }
              state.tag[t].push(categoryItem)
            })
            // 递增数量,当全部查完后按修改时间排序
            cnt++
            if (cnt === total) {
              state.fileList = arrayUtil.quickSort(state.fileList)
            }
          })
        }
      })
    }
  }
}

/**
 * 构建博文实例
 * @param {string} e filename
 * @param {{modifyTime: string, s: string}} r
 * @returns item
 */
function getFileListItem (e, r) {
  const item = {}
  const eArr = e.substr(1).split('/')
  e = e.substr(1)
  if (eArr.length === 2) {
    item.fileName = eArr[1].replace('.js', '')
  } else if (eArr.length === 3) {
    item.fileName = eArr[2].replace('.js', '')
    item.category = eArr[1]
  }
  // 获取创建时间
  let tmpName = item.fileName
  const regOfCreateTime = /\d{4}-\d{2}-\d{2}/
  const tmpCreate = regOfCreateTime.exec(tmpName)[0]
  item.create = moment(tmpCreate)
  item.routePath = tmpName.substr(tmpCreate.length + 1)
  // 读取js内容
  item.path = e
  // 读取文件最新修改时间
  item.modify = r.modifyTime
  item.modifyDate = moment(item.modify).toDate()
  // 获取首页展示内容
  // let ts = mdUtil.md2html(r.s)
  let ts = unescape(r.s.replace(/&#x(.{4});/g, '%u$1'))
  ts = ts.replace(/<(\S*?)[^>]*>.*?|<.*? \/ >/g, ' ')
  ts = ts.replace('\\n', '')
  item.preview = ts.substr(0, 700)
  let aboveWords = ts.split(' ').length
  item.words = '约' + (aboveWords - (aboveWords >= 1000 ? aboveWords % 1000 : (aboveWords >= 100 ? aboveWords % 100 : aboveWords % 10))) + '字'
  item.message = stringUtil.mdTitle2Msg(r.topMsg)
  item.title = item.message.title.replaceAll('-', ' ')
  item.title = stringUtil.toTitle(item.title)
  return item
}

/**
 * 更新标记的日期
 * @param {Array} labelDays store.state.md.labelDays
 * @param {{create: string, modifyDate: Date}} item fileList item
 */
function updateLabelDays (labelDays, item) {
  const t1 = item.create
  const t2 = moment(item.modifyDate)
  let flag1 = false
  let flag2 = false
  labelDays.forEach(item => {
    flag1 |= item.isSame(t1)
    flag2 |= item.isSame(t2)
  })
  !flag1 && labelDays.push(t1)
  !flag2 && labelDays.push(t2)
}

export default md
