const mode = {
  namespace: true,
  state () {
    return {
      isMobile: navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i),
      isRouteAlive: true
    }
  },
  getters: {
    isMobile: (state) => state.isMobile
  },
  mutations: {
    changeMode (state, payload) {
      if (payload.to === true || payload.to === false) {
        state.isMobile = payload.to
      } else {
        state.isMobile = false
      }
    }
  }
}

export default mode
