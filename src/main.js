// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import r from './router'
/* eslint-disable */
import hljs from 'highlight.js/lib/highlight'
import 'highlight.js/styles/monokai-sublime.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import store from './store'
import mdUtil from './utils/mdUtil'

Vue.prototype.md2html = (md) => mdUtil.md2html(md)

Vue.config.productionTip = false
Vue.prototype.routeName = {
  ...r.routeName
}

Vue.use(ElementUI)
new Vue({
  el: '#app',
  store,
  router: r.router,
  components: { App },
  template: '<App/>'
})
