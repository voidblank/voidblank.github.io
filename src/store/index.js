import Vue from 'vue'
import Vuex from 'vuex'
import md from './md'
import mode from './mode'
import styles from './styles'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    md,
    mode,
    styles
  },
  state: {

  },
  mutations: {

  },
  actions: {}
})
