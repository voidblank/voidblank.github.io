<template>
  <div id="app">
    <div id="top"/>
    <router-view v-if="$store.state.mode.isMobile" name="mobile"/>
    <router-view v-else name="desktop"/>
    <a id="back-to-top" @click="scrollTo('top')" v-show="isNotTop">
      <el-button icon="el-icon-arrow-up" @click="handleClick" plain circle/>
    </a>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      isNotTop: false
    }
  },
  created () {
    this.$store.dispatch('getFiles')
    window.addEventListener('scroll', this.handleScroll, true)
  },
  mounted () {
    let fs = window.innerWidth * 16 / 1920
    document.getElementsByTagName('html')[0].style.fontSize = '16px'
    const vm = this
    vm.$store.commit('changeMode', {vm: vm, to: fs < 9})
    window.onresize = function (ev) {
      let fs = window.innerWidth * 16 / 1920
      // document.getElementsByTagName('html')[0].style.fontSize = fs + 'px'
      vm.$store.commit('changeMode', {vm: vm, to: fs < 9})
    }
  },
  beforeDestroy () {
    window.onresize = undefined
    window.removeEventListener('scroll', this.handleScroll, true)
  },
  methods: {
    /**
     * 检查是否展示 滚至顶部 图标
     */
    handleScroll () {
      let scrolltop = document.documentElement.scrollTop || document.body.scrollTop
      this.isNotTop = scrolltop > 30
    },
    /**
     * 点击按钮后,自动失焦
     * @param e
     */
    handleClick (e) {
      let target = e.target
      // 根据button组件内容 里面包括一个span标签，如果设置icon，则还包括一个i标签，其他情况请自行观察。
      // 所以，在我们点击到button组件上的文字也就是span标签上时，直接执行e.target.blur()不会生效，所以要加一层判断。
      if (target.nodeName === 'SPAN' || target.nodeName === 'I') {
        target = e.target.parentNode
      }
      target.blur()
    },
    /**
     * 跳转到指定id位置,为滚到顶部与跳转到指定位置服务的方法
     * 平滑滚动
     * @param {string} id
     */
    scrollTo (id) {
      const PageId = document.querySelector('#' + id)
      PageId.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'start'})
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
#back-to-top{
  bottom: 6.5rem;
  right: 4.3rem;
  display: inline;
  position: fixed;
  text-decoration: none;
}
.page-title{
  font-size: 36px;
  margin-bottom: 3.0rem;
}
</style>
