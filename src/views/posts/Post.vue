<template>
<div>
  <div class="top">
    <h1 class="title menu-header">{{ post.title }}</h1>
    <span class="author">{{ post.message.author }}</span>
      write on
    <el-tooltip class="item" :effect="$store.getters.isDark ? 'light' : 'dark'" :content="post.create" placement="bottom">
      <span>{{ post.createTime }}</span>
    </el-tooltip>
    · updated
    <el-tooltip class="item" :effect="$store.getters.isDark ? 'light' : 'dark'" :content="post.modify" placement="bottom">
      <span>{{ post.modifyTime }}</span>
    </el-tooltip>
  </div>
  <div v-html="context" style="line-height: 30px;"/>
</div>
</template>
<script>
import moment from 'moment'
import timeUtil from '../../utils/timeUtil'
export default {
  name: 'post',
  props: {
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      context: 'catrgory: ' + this.category + ' ,title: ' + this.title,
      post: {},
      sidebar: undefined
    }
  },
  watch: {
    '$store.state.mode.isMobile': {
      handler (value) {
        if (this.sidebar === undefined) {
          return
        }
        if (value) {
          this.sidebar.style.display = 'none'
          document.getElementsByClassName('md-sidebar-toc')[0].style.display = 'none'
        } else {
          this.sidebar.style.display = ''
        }
      }
    }
  },
  created () {
    this.init()
  },
  beforeDestroy () {
    this.sidebar && this.sidebar.removeEventListener('click', this.initRightSideButton)
  },
  methods: {
    /**
     * 初始化,读取文件,进行转换
     */
    async init () {
      const vm = this
      const file = vm.$store.getters.getUrlByCategoryAndTitle({ category: this.category, title: this.title })
      this.post = file
      await import('@/assets/posts' + file.path).then(response => {
        vm.context = response.s
      })
      this.postTopMessage()
      scrollTo(0, 0)
      this.$nextTick(() => {
        const sidebar = document.getElementById('sidebar-toc-btn')
        sidebar.addEventListener('click', this.initRightSideButton, true)
        this.sidebar = sidebar
        if (this.$store.state.mode.isMobile) {
          this.sidebar.style.display = 'none'
          document.getElementsByClassName('md-sidebar-toc')[0].style.display = 'none'
        }
      })
    },
    postTopMessage () {
      this.post.create = moment(this.post.create).format('YYYY-MM-DD')
      this.post.createTime = timeUtil.getShowTime(this.post.create)
      this.post.modifyTime = timeUtil.getShowTime(this.post.modify)
    },
    initRightSideButton (event) {
      event.stopPropagation()
      let sideMenu = document.getElementsByClassName('md-sidebar-toc')[0]
      if (sideMenu.style.display === 'none') {
        sideMenu.style.display = ''
      } else {
        sideMenu.style.display = 'none'
      }
    }
  }
}
</script>
<style src="../../style/light-style.css"></style>
<style>
html body h1, html body h2, html body h3, html body h4, html body h5 {
    font-weight: 400;
}
.top{
  user-select: none;
  color: #6C757D;
  margin-bottom: 5.0rem;
}
.title{
  color: #000000;
  margin-bottom: 1.8rem;
  margin-top: 0.5rem;
}
.author{
  font-weight: 600 !important;
}
.my-code {
  padding: 1.125rem 1.5rem 1.125rem 1rem;
  line-height: 1.25rem;
}
pre[class^='language-']::before {
  content: attr(data-info);
  right: 2rem;
  margin-top: 3px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #8c8c8c;
  float: right;
}
.code-mark {
  display: none;
  position: absolute;
  right: 2rem;
  line-height: 1rem;
  float: right;
  user-select: none;
  color: #8c8c8c;
}
.md-sidebar-toc{
  position: fixed;
  top: 0;
  right: 0;
  bottom: 1;
  width: 18.75rem;
  height: 100%;
  padding: 3rem 0 4rem 0;
  font-size: .875rem;
  box-shadow: 0 0 .25rem rgb(150 150 150 / 33%);
  box-sizing: border-box;
  overflow: auto;
  background-color: inherit;
  margin-top: 3.06rem;
}
html body .md-sidebar-toc ul{
  list-style-type: none;
}
#sidebar-toc-btn{
  position: fixed;
  top: 1rem;
  right: 1.25rem;
  font-size: 1.75rem;
  cursor: pointer;
  color: inherit;
  z-index: 99;
  width: 2rem;
  text-align: center;
  opacity: .4;
  margin-top: 2.5rem;
}
</style>
