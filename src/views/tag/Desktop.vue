<template>
  <div>
    <el-container>
      <el-main>
      <tag/>
      </el-main>
      <el-footer></el-footer>
    </el-container>
  </div>
</template>
<script>
import tag from './Tag.vue'
export default {
  name: 'tagOfDesktop',
  components: {tag}
}
</script>
