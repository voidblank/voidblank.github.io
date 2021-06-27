<template>
  <el-container>
    <el-main>
    <home-list/>
    </el-main>
    <el-footer></el-footer>
  </el-container>
</template>
<script>
import HomeList from './HomeList.vue'
export default {
  name: 'homeOfMobile',
  components: {HomeList}
}
</script>
