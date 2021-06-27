<template>
<transition name="topbar-anime">
  <div id="topbar-wrapper" v-show="isUp">
    <div class="route-title">
      {{ topTitle }}
    </div>
    <div class="input-out">
      <el-icon class="el-icon-search suffix-search"/>
      <input v-model="keyWord" placeholder="请输入" @input="changeWord" class="input-style"/>
      <div @click="clear" v-show="keyWord !== undefined">
        <el-icon class="el-icon-circle-close suffix-search"/>
      </div>
    </div>
  </div>
</transition>
</template>
<script>
export default {
  name: 'topBar',
  data () {
    return {
      lastScroll: 0,
      isUp: true,
      topTitle: undefined,
      keyWord: undefined
    }
  },
  watch: {
    '$route': {
      handler (value) {
        let r = value.name
        if (value.params) {
          if (r === this.routeName.post) {
            r += '/' + value.params.category + '/' + value.params.title
          } else if (r === this.routeName.tag) {
            r += '/' + value.params.tagName
          }
        }
        this.topTitle = r
      }
    }
  },
  mounted () {
    window.addEventListener('scroll', this.checkScroll)
  },
  beforeDestroy () {
    window.removeEventListener('scroll', this.checkScroll)
  },
  methods: {
    checkScroll () {
      let s = window.scrollY
      this.isUp = s <= this.lastScroll
      this.lastScroll = s
    },
    changeWord () {
      this.keyWord = this.keyWord.trim()
      if (this.keyWord === '') {
        this.keyWord = undefined
        return
      }
      console.log(this.keyWord)
    },
    clear () {
      this.keyWord = undefined
    }
  }
}
</script>
<style scoped>
#topbar-wrapper {
  height: 3rem;
  position: fixed;
  /* top: .7rem; */
  left: 20.3rem;
  right: 0;
  transition: top 0.2s ease-in-out;
  z-index: 50;
  border-bottom: 1px solid rgba(0,0,0,0.07);
  box-shadow: 0 3px 5px 0 rgb(0 0 0 / 5%);
  background-color: white;
}
.route-title{
  display: flex;
  position: fixed;
  font-size: 1rem;
  color: gray;
  padding-left: 0.5rem;
  left: 26rem;
}
.input-out{
  display: flex;
  top: .3rem;
  right: 10rem;
  position: fixed;
  border-radius: 1rem;
  border: 1px solid #F5F5F5;
  background: #F5F5F5;
  padding: 0 0.5rem;
  width: 16rem;
}
.suffix-search{
  z-index: 2;
  padding: 0.18rem 0.3rem;
  color: #C2C6CC;
  margin-top: .2rem;
}
.input-style{
  background: center;
  border: 0;
  border-radius: 0;
  padding: 0.18rem 0.3rem;
  color: #4A4A4A;
  font-size: 95%;
  outline: none;
  height: 1.5rem;
}
.input-style:checked{
  box-shadow: none;
  border-color: #E9ECEF !important;
  background: center !important;
  /* transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out; */
}
.topbar-anime-enter-active {
  transition: all .5s ease;
}
.topbar-anime-leave-active {
  transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.topbar-anime-enter, .topbar-animie-leave-to{
  /* transform: translateY(10px); */
  transform: translateX(10px);
  opacity: 0;
}
</style>
