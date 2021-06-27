<template>
  <el-container>
    <el-container>
      <el-main class="main-page">
        <home-list/>
      </el-main>
      <el-footer></el-footer>
    </el-container>
    <el-aside style="width: 27.5%;">
      <side/>
    </el-aside>
  </el-container>
</template>
<script>
import HomeList from './HomeList.vue'
import Side from './Side.vue'
export default {
  name: 'homeOfDesktop',
  components: {
    HomeList,
    Side
  }
}
</script>
