<template>
  <el-container>
    <el-main>
      <router-view name="mobile"/>
    </el-main>
    <el-footer>
      <foot/>
    </el-footer>
  </el-container>
</template>
<script>
import Foot from './Foot.vue'
export default {
  components: { Foot },
  name: 'basicMobile',
  methods: {
    change2Desktop () {}
  }
}
</script>
<style scoped>
.change-context{
  font-size: .8rem;
  cursor: pointer;
  line-height: 1.2rem;
  width: 95%;
  max-width: 1045px;
  border-top: 1px solid #F3F3F3;
  margin-bottom: 1rem;
}
</style>
