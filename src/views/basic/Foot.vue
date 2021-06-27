<template>
  <div class="footer">
    <div @click="change2Mobile" class="change-context">{{ $store.state.mode.isMobile ? 'PC版' : '手机版' }}</div>
  </div>
</template>
<script>
export default {
  name: 'foot',
  methods: {
    change2Mobile () {
      this.$store.commit('changeMode', {vm: this, to: !this.$store.state.mode.isMobile})
    }
  }
}
</script>
<style scoped>
.footer{
  line-height: 1.2rem;
  width: 95%;
  max-width: 1045px;
  border-top: 1px solid #F3F3F3;
  margin: 0 20% 1rem 5%;
}
.change-context{
  font-size: 1rem;
  cursor: pointer;
  margin: .8rem 0 0 2rem;
}
.change-context:hover{
  color: #D2603A;
}
</style>
