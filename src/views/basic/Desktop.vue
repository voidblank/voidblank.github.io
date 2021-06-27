<template>
  <el-container>
    <el-aside style="width: 20.3rem;">
      <side class="side" id="side-out"/>
    </el-aside>
    <el-container>
      <el-header style="height: 3rem;">
        <top-bar/>
      </el-header>
      <el-main>
        <router-view name="desktop"/>
      </el-main>
      <el-footer>
        <foot/>
      </el-footer>
    </el-container>
  </el-container>
</template>
<script>
import Foot from './Foot.vue'
import Side from './Side.vue'
import TopBar from './TopBar.vue'
export default {
  name: 'basicDesktop',
  components: { Side, TopBar, Foot }
}
</script>
<style>
.main-page{
  margin-left: 3.3rem;
  padding: 0px 20px;
}
.side{
  height: 59.12rem;
  width: 20.3rem;
}
</style>
