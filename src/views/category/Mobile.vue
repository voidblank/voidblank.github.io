<template>
  <div>
    <el-container>
      <el-main>
        <category/>
      </el-main>
      <el-footer></el-footer>
    </el-container>
  </div>
</template>
<script>
import category from './Category.vue'
export default {
  name: 'categoryOfMobile',
  components: {category}
}
</script>
