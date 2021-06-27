import moment from 'moment'

/**
 * get show time text of origin time
 * @param {*} originTime origin time, maybe string or Date or moment
 */
function getShowTime (originTime) {
  if (originTime === undefined || originTime === null) {
    return ''
  }
  const today = moment()
  let m = moment(originTime)
  if (m.year() !== today.year()) {
    return m.year() + '年 ' + (m.month() + 1) + '月 ' + m.date() + '日'
  }
  if (m.week() !== today.week()) {
    return (m.month() + 1) + '月 ' + m.date() + '日'
  }
  if (m.day() !== today.day()) {
    return (today.dayOfYear() - m.dayOfYear()) + '天前'
  }
  if (m.hour() !== today.hour()) {
    return (today.hour() - m.hour()) + '小时前'
  }
  return (today.minute() - m.minute()) + '分钟前'
}

export default {
  getShowTime
}
