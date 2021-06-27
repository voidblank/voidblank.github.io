<template>
  <div id="calendar" class="calendar" style="display: block;">
    <div class="calendar-title">
      <a href="javascript:0" class="title">
        <span @click="handleTitle(YEAR)">{{ titleOfYear }}</span>
        /
        <span @click="handleTitle(MONTH)">{{ titleOfMonth }}</span>
      </a>
      <a id="backToday" @click="jump2Today">T</a>
      <div class="arrow">
        <span class="arrow-prev" @click="handlePrev">&lt;</span>
        <span class="arrow-next" @click="handleNext">&gt;</span>
      </div>
    </div>
    <template v-if="board === 0">
      <ul class="calendar-week">
        <li class="item" v-for="(week, idx) of weekToCn" :key="idx">{{ week }}</li>
      </ul>
      <ul class="calendar-date">
        <template>
          <li
            v-for="(item, index) of monthDays"
            :key="index"
            :class="getClass(item)"
            class="item"
            :data="item.showDate"
            @mouseover="handleOver"
            @mouseout="handleOut"
            @click="handleDate(item)">
            {{ item.day }}
          </li>
        </template>
      </ul>
    </template>
    <template v-else-if="board === MONTH">
      <div class="calendar-month">
        <div
          v-for="(m, idx) of months"
          :key="idx"
          class="item"
          @click="chooseMonth(idx)"
          :class="containsMonth(labelDays, idx) ? 'item-labelMonth' : ''">
          {{ m }}
        </div>
      </div>
    </template>
    <template v-else-if="board === YEAR">
      <div class="calendar-year">
        <div
          v-for="(y, idx) of years"
          :key="idx"
          class="item"
          @click="chooseYear(idx)"
          :class="containsYear(labelDays, y) ? 'item-labelYear' : ''">
          {{ y }}
        </div>
      </div>
    </template>
    <transition name="slide-fade" :duration="{ enter: 300, leave: 0 }">
      <div class="calendar-today" v-show="isShow" :style="showStyle" :id="showDayId">
        <i class="triangle"/>
        <p class="date">{{ showDate }}</p>
        <p class="week">{{ showWeek }}</p>
      </div>
    </transition>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  name: 'Calendar',
  props: {
    // 起始年份
    startYear: {
      type: [Number, String],
      default: 1,
      validator: function (value) {
        if (value instanceof Number) {
          return value > 0
        }
        return !isNaN(parseInt(value))
      }
    },
    // 终止年份
    endYear: {
      type: [Number, String],
      default: 9999,
      validator: function (value) {
        if (value instanceof Number) {
          return value > 0
        }
        return !isNaN(parseInt(value))
      }
    },
    // 有标记的日子数组
    labels: {
      type: Array,
      default: () => [],
      validator: function (value) {
        for (let i = 0; i < value.length; i++) {
          if (!moment(value[i]).isValid()) {
            return false
          }
        }
        return true
      }
    }
  },
  data () {
    return {
      DATE: 0,
      MONTH: 1,
      YEAR: 2,
      today: {},
      year: undefined,
      month: undefined,
      monthDays: [],
      isShow: false,
      showStyle: {
        display: 'block',
        right: '0px',
        top: '0px',
        opacity: '1'
      },
      showDate: undefined,
      showWeek: undefined,
      weekToCn: ['日', '一', '二', '三', '四', '五', '六'],
      showDayId: 'calendar-show-id',
      labelDays: [],
      board: 0,
      months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      years: [],
      pStartYear: 1,
      pEndYear: 9999
    }
  },
  computed: {
    /**
     * 标题,已弃用
     */
    title () {
      return this.year + '/' + ((this.month + 1) < 10 ? '0' + (this.month + 1) : this.month + 1)
    },
    /**
     * 标题的年
     */
    titleOfYear () {
      return this.year
    },
    /**
     * 标题的月
     */
    titleOfMonth () {
      return (this.month + 1) < 10 ? '0' + (this.month + 1) : this.month + 1
    }
  },
  watch: {
    /**
     * 起始年份监听器
     */
    startYear: {
      handler (value) {
        if (value instanceof String) {
          const y = parseInt(value)
          this.pStartYear = isNaN(y) ? 1 : Math.min(y, this.pEndYear)
        } else {
          this.pStartYear = Math.min(value, this.pEndYear)
        }
      }
    },
    /**
     * 截至年份监听器
     */
    endYear: {
      handler (value) {
        if (value instanceof String) {
          const y = parseInt(value)
          this.pEndYear = isNaN(y) ? 9999 : Math.max(y, this.pStartYear)
        } else {
          this.pEndYear = Math.max(value, this.pStartYear)
        }
      }
    },
    /**
     * 标记日子监听器
     */
    labels: {
      handler (value) {
        this.labelDays = []
        if (value instanceof Array) {
          value.forEach(item => {
            this.labelDays.push(moment(item))
          })
        }
      }
    }
  },
  created () {
    const t = moment(new Date())
    this.today = {
      year: t.year(),
      month: t.month(),
      day: t.date()
    }
    this.year = this.today.year
    this.month = this.today.month
    this.labelDays = this.labels
    this.initYear()
    this.setYearArray(this.year)
    this.getDays(this.year, this.month)
  },
  methods: {
    /**
     * 获取指定年月下的日子,从当月第一周到当月最后一周(或最后一周+1周)
     * @param {Number} year 年
     * @param {Number} month 月
     */
    getDays (year, month) {
      this.monthDays = []
      const firstDayOfMonth = moment([year, month, 1])
      const endDayOfMonth = moment(firstDayOfMonth).add(1, 'months').subtract(1, 'days')
      const lastMonday = moment(firstDayOfMonth).day(0)
      for (let i = lastMonday.date(), j = 0; j < firstDayOfMonth.day() - lastMonday.day(); j++, i++) {
        let m = moment(lastMonday).add(j, 'days')
        this.monthDays.push({
          day: i,
          isThisMonth: false,
          isLabeled: this.containsMoment(this.labelDays, m),
          showDate: m.format('YYYY-MM-DD')
        })
      }
      for (let i = 1; i <= endDayOfMonth.date(); i++) {
        let m = moment([year, month, i])
        this.monthDays.push({
          day: i,
          isThisMonth: true,
          isLabeled: this.containsMoment(this.labelDays, m),
          showDate: m.format('YYYY-MM-DD')
        })
      }
      for (let i = this.monthDays.length, j = 1; i < 6 * 7; i++, j++) {
        let m = moment(endDayOfMonth).add(j, 'days')
        this.monthDays.push({
          day: j,
          isThisMonth: false,
          isLabeled: this.containsMoment(this.labelDays, m),
          showDate: m.format('YYYY-MM-DD')
        })
      }
    },
    /**
     * 判断该日子是否是今天
     * @param {Number} day
     */
    isToday (day) {
      return this.year === this.today.year && this.month === this.today.month && day === this.today.day
    },
    /**
     * 获取日历上每一天的类
     * @param {{day: Number, data: string, isThisMonth: boolean, isLabeled: boolean}} item
     */
    getClass (item) {
      if (!item.isThisMonth) {
        return item.isLabeled ? 'item-labelDay2' : ''
      }
      if (this.isToday(item.day)) {
        return 'item-curDay'
      }
      if (item.isLabeled) {
        return 'item-labelDay'
      }
      return 'item-curMonth'
    },
    /**
     * 点击前一个箭头时,触发的效果方法
     */
    handlePrev () {
      switch (this.board) {
        case this.YEAR: {
          this.year = Math.max(this.year - 9, this.pStartYear + 4)
          this.setYearArray(this.year)
          break
        }
        case this.MONTH: {
          this.year -= 1
          this.setYearArray(this.year)
          break
        }
        case this.DATE: {
          if (this.year === this.pStartYear && this.month === 0) {
            break
          }
          this.month -= 1
          if (this.month === -1) {
            this.year -= 1
            this.month = 11
          }
        }
      }
      this.getDays(this.year, this.month)
    },
    /**
     * 点击后一个箭头时,触发的效果方法
     */
    handleNext () {
      switch (this.board) {
        case this.YEAR: {
          this.year = Math.min(this.year + 9, this.pEndYear - 4)
          this.setYearArray(this.year)
          break
        }
        case this.MONTH: {
          this.year += 1
          this.setYearArray(this.year)
          break
        }
        case this.DATE: {
          if (this.year === this.pEndYear && this.month === 11) {
            break
          }
          this.month += 1
          if (this.month === 12) {
            this.year += 1
            this.month = 0
          }
        }
      }
      this.getDays(this.year, this.month)
    },
    /**
     * 跳转至今天
     */
    jump2Today () {
      this.year = this.today.year
      this.month = this.today.month
      this.board = this.DATE
      this.getDays(this.year, this.month)
    },
    /**
     * 鼠标移动在具体的日子上时,浮动框的展示
     * @param {MouseEvent} e
     */
    handleOver (e) {
      this.isShow = false
      this.showStyle = {
        display: 'block',
        right: '0px',
        top: '0px',
        opacity: '1'
      }
      const vm = this
      const te = e.target
      const rect = te.getBoundingClientRect()
      vm.showDate = te.getAttribute('data')
      vm.showWeek = '星期' + vm.weekToCn[moment(vm.showDate).day()]
      const modal = document.getElementById('calendar').getBoundingClientRect()
      // const elem = document.getElementById(this.showDayId)
      // const h = this.getStyleValue(elem, 'height').slice(0, -2)
      // const offsetLeft = rect.left - 2 * rect.width
      const offsetRight = (modal.right - rect.right + rect.width) + parseFloat(document.getElementsByTagName('html')[0].style.fontSize.slice(0, -2))
      vm.showStyle.right = offsetRight + 'px'
      // const offsetTop = rect.top + window.pageYOffset + (h - rect.height) / 2
      const offsetTop = rect.top + (rect.bottom - rect.top) / 2 - modal.top
      vm.showStyle.top = offsetTop + 'px'
      vm.isShow = true
    },
    /**
     * 鼠标移出日子时,隐藏浮动框
     */
    handleOut (e) {
      this.isShow = false
    },
    /**
     * 获取某个元素的某个属性值
     * @param elem 元素名或元素
     * @param {String} attr 属性名
     */
    getStyleValue (elem, attr) {
      elem = elem instanceof String ? document.getElementById(elem) : elem
      return document.defaultView.getComputedStyle(elem)[attr]
    },
    /**
     * 判断数组中是否包含某个moment
     * @param {Array} arr 要检查的数组
     * @param {moment} item 要判断的moment
     */
    containsMoment (arr, item) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].isSame(item)) {
          return true
        }
      }
      return false
    },
    /**
     * 判断arr中是否包含指定月份
     * @param {Array} arr 要检查的数组
     * @param {Number} month 要检查的月份
     */
    containsMonth (arr, month) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].month() === month && arr[i].year() === this.year) {
          return true
        }
      }
      return false
    },
    /**
     * 判断arr中是否包含指定年份
     * @param {Array} arr 要检查的数组
     * @param {Number} year 要检查的年份
     */
    containsYear (arr, year) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].year() === year) {
          return true
        }
      }
      return false
    },
    /**
     * 点击标题时触发的方法
     * @param {Number} i 判断点击的是年还是月
     */
    handleTitle (i) {
      this.board = this.board === i ? this.DATE : i
      if (this.board === this.YEAR) {
        this.setYearArray(this.year)
      }
    },
    /**
     * 在月历中点击某个具体的月份时,跳转到当月的日历
     * @param {Number} idx 月份,[0, 12)
     */
    chooseMonth (idx) {
      this.month = idx
      this.board = this.DATE
      this.getDays(this.year, this.month)
    },
    /**
     * 在年历中点击某个具体的年份时,跳转到当月的日历,月份是根据标题上的月来判断的
     * @param {Number} idx 选择的年,在this.years中的索引
     */
    chooseYear (idx) {
      this.year = this.years[idx]
      this.board = this.DATE
      this.getDays(this.year, this.month)
    },
    /**
     * 设置展示的年的数组
     * @param {Number} mid 居中的年份
     */
    setYearArray (mid) {
      this.years = []
      for (let i = mid - 4; i <= mid + 4; i++) {
        this.years.push(i)
      }
    },
    /**
     * 初始化年历的范围
     */
    initYear () {
      if (this.startYear instanceof String) {
        const y = parseInt(this.startYear)
        this.pStartYear = isNaN(y) ? 1 : Math.min(y, this.pEndYear)
      } else {
        this.pStartYear = Math.min(this.startYear, this.pEndYear)
      }
      if (this.endYear instanceof String) {
        const y = parseInt(this.endYear)
        this.pEndYear = isNaN(y) ? 9999 : Math.max(y, this.pStartYear)
      } else {
        this.pEndYear = Math.max(this.endYear, this.pStartYear)
      }
    },
    /**
     * 点击某个具体日子时触发
     * @param {{day: string,isLabeled: boolean,showDate: string}} item
     */
    handleDate (item) {
      this.$emit('clickDate', {date: moment(item.showDate), isLabeled: item.isLabeled})
    }
  }
}
</script>
<style scoped>
  * { margin: 0; padding: 0; }
  body {
    font-family: "Microsoft Yahei";
    font-size: 0.75rem;
    color: #888;
  }
  a, a:hover { color: #888; text-decoration: none; }
  ul, li { list-style: none; }

  .calendar {
    width: 21.88rem;
    padding: 0.6rem;
    margin: 1.88rem auto 0;
    background-color: #fafafa;
    border-radius: 0.38rem;
  }
  .calendar-title {
    position: relative;
    height: 1.88rem;
    line-height: 1.88rem;
    padding: 0.6rem 0;
  }
  .calendar-title a.title {
    display: inline-block;
    font-size: 1.6rem;
    text-indent: 0.6rem;
  }
  #backToday {
    position: absolute;
    left: 70%;
    top: 0.5rem;
    width: 2.5rem;
    height: 2.5rem;
    line-height: 2.5rem;
    text-align: center;
    border-radius: 50%;
    color: #fff;
    background-color: rgb(255, 128, 142);
    font-size: 1.15rem;
    cursor: pointer;
  }
  .calendar-title .arrow {
    position: absolute;
    top: 0.63rem;
    right: 0;
    width: 3.12rem;
  }
  .calendar-title .arrow span {
    color: #ddd;
    font-size: 1.6rem;
    cursor: pointer;

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
  }
  .calendar-title .arrow span:hover {
    color: #888;
  }
  .calendar-title .arrow-prev {
    float: left;
  }
  .calendar-title .arrow-next {
    float: right;
  }
  .calendar-week,
  .calendar-date {
    overflow: hidden;
  }
  .calendar-week .item,
  .calendar-date .item {
    float: left;
    width: 3.12rem;
    height: 3.12rem;
    line-height: 3.12rem;
    text-align: center;
  }
  .calendar-week {
    padding-bottom: 0.38rem;
    border-bottom: 0.063rem solid rgb(255, 128, 142);
    font-weight: bold;
    font-size: 1rem;
  }
  /* .calendar-date {} */
  .calendar-date .item {
    border-radius: 50%;
    cursor: pointer;
    font-size: 0.88rem;
  }
  .calendar-date .item:hover,
  .calendar-date .item-curMonth:hover {
    background-color: #f0f0f0;
  }
  .calendar-date .item-curMonth {
    color: #333;
  }
  .calendar-date .item-curDay,
  .calendar-date .item-curDay:hover {
    color: #fff;
    background-color: rgb(255, 128, 142);
  }
  .calendar-date .item-labelDay,
  .calendar-date .item-labelDay:hover {
    color: #fff;
    background-color: #1ba5f2;
  }
  .calendar-date .item-labelDay2,
  .calendar-date .item-labelDay2:hover {
    color: #fff;
    background-color: darkgray;
  }
  .calendar-today {
    display: none;
    opacity: 0;
    position: absolute;
    right: 1.25rem;
    top: 1.25rem;
    width: 5.6rem;
    height: 3rem;
    padding: 0.38rem 0.63rem;
    background-color: rgb(255, 128, 142);
    border-radius: 0.313rem;
  }
  .calendar-today .triangle {
    position: absolute;
    top: 50%;
    left: 6.88rem;
    margin-top: -0.5rem;
    border-width: .5rem;
    border-style: solid;
    border-color: transparent rgb(255, 128, 142) transparent transparent;
    transform: rotateY(180deg);
  }
  .calendar-today p {
    color: #fff;
    font-size: 0.88rem;
    line-height: 1.5rem;
  }
  .calendar-month {
    overflow: hidden;
    height: 19.69rem;
    margin-top: 2.6rem;
  }
  .calendar-month .item{
    display: inline-block;
    width: 3.85rem;
    height: 3.55rem;
    line-height: 3.1rem;
    text-align: center;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.25rem;
    font-weight: 400;
    margin: 1.25rem 0.73rem 1.25rem 0.73rem;
  }
  .calendar-month .item:hover {
    background-color: #f0f0f0;
  }
  .calendar-month .item-labelMonth,
  .calendar-month .item-labelMonth:hover {
    color: #fff;
    background-color: #1ba5f2;
  }
  .calendar-year {
    overflow: hidden;
    height: 19.69rem;
    margin-top: 2.6rem;
  }
  .calendar-year .item {
    display: inline-block;
    width: 3.75rem;
    height: 3.55rem;
    line-height: 3.1rem;
    text-align: center;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.25rem;
    font-weight: 400;
    margin: 1.25rem 1.525rem 1.25rem 1.525rem;
  }
  .calendar-year .item:hover {
    background-color: #f0f0f0;
  }
  .calendar-year .item-labelYear,
  .calendar-year .item-labelYear:hover {
    color: #fff;
    background-color: #1ba5f2;
  }
  .slide-fade-enter-active {
    transition: all .3s ease;
  }
  .slide-fade-leave, .slide-fade-leave-active {
    transition: all .0s;
    opacity: 0;
  }
  .slide-fade-enter {
    transform: translateX(-10px);
    opacity: 0;
  }
</style>
