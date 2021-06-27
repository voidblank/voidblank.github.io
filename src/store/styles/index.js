const styles = {
  namespace: true,
  state () {
    return {
      isDark: false
    }
  },
  getters: {
    isDark: (state) => state.isDark
  },
  mutations: {
    changeAllStyle (state) {
      state.isDark = !state.isDark
    }
  }
}

export default styles
