<template>
  <div>
    <el-container>
      <el-container>
        <el-header style="height: 30px;">
        </el-header>
        <el-main class="main-page">
          <post :title="title" :category="category"/>
        </el-main>
        <el-footer style="height: auto;">
          <comment/>
        </el-footer>
      </el-container>
      <el-aside style="width: 30%;">
      </el-aside>
    </el-container>
  </div>
</template>
<script>
import Post from './Post.vue'
import comment from '../comment'
export default {
  name: 'DesktopPost',
  components: { Post, comment },
  props: {
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      treeData: [],
      rightSideWidth: '300px', // default
      currentKey: undefined,
      treeIdPosition: [],
      treeIdMap: {}
    }
  },
  watch: {
    currentKey: {
      // 监听key的变化值,注意该值和tree中的key并非一个值
      handler () {
        // 发生变化后,修改tree内部的key,将除了该节点之外的节点都收起
        this.$refs.tree.setCurrentKey(this.currentKey)
        const map = this.$refs.tree.store.nodesMap
        Object.keys(map).forEach(k => {
          map[k].expanded = k === this.currentKey
        })
        // 之后递归拿到所有的节点
        this.findParentIdBySubId(this.currentKey)
      }
    }
  }
}
</script>
<style>
html, body{
  scroll-behavior: smooth;
}
</style>
