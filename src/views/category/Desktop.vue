<template>
  <div>
    <el-container>
      <el-main  class="main-page">
        <category/>
      </el-main>
      <el-footer></el-footer>
    </el-container>
  </div>
</template>
<script>
import category from './Category.vue'
export default {
  name: 'categoryOfDesktop',
  components: {category}
}
</script>
