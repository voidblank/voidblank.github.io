<template>
<div>
  <div class="page-title">
    Category
  </div>
  <div v-for="(item, index) of Object.keys(treeData)" :key="index">
    <div class="card">
      <div class="card-header" @click="handleButton(item)">
        <i :class="isActive[item] ? 'el-icon-folder-opened' : 'el-icon-folder'"/>
        <span class="card-text">{{ item }}</span>
        <span style="font-size: 13px;">{{treeData[item].length}} posts</span>
        <i :class="isActive[item] ? 'el-icon-arrow-down' : 'el-icon-arrow-right'" class="card-button"/>
      </div>
      <transition name="fade">
        <ul class="card-item-group" v-show="isActive[item]" :id="item">
          <li v-for="(p, idx) of treeData[item]" :key="idx" class="card-item">
            <i class="el-icon-document"/>
            <a @click="$router.push({ name: routeName.post, params: { category: item, title: p.path }})" class="card-text card-link" >{{ p.title }}</a>
          </li>
        </ul>
      </transition>
    </div>
  </div>
</div>
</template>
<script>
export default {
  name: 'category',
  data () {
    return {
      treeData: this.$store.state.md.category,
      isActive: {}
    }
  },
  created () {
    Object.keys(this.treeData).forEach(k => {
      this.isActive[k] = false
    })
  },
  methods: {
    /**
     * @param {string} item
     */
    handleButton (item) {
      const vm = this
      vm.isActive[item] = !vm.isActive[item]
      vm.$forceUpdate()
    }
  }
}
</script>
<style scoped>
.card{
  margin-bottom: 2rem;
  word-wrap: break-word;
  background-color: #fff;
  background-clip: border-box;
  border: 1px solid rgba(0,0,0,.125);
  border-radius: .25rem;
}
.card-header{
  padding: .75rem 1.25rem;
  margin-bottom: 0;
  background-color: rgba(0,0,0,.03);
  cursor: pointer;
}
.card-text{
  margin-left: .25rem!important;
  margin-right: .5rem!important;
  font-size: 18px;
}
.card-link{
  font-size: 14px;
  color: #2A408E;
  /* cursor: pointer; */
}
.card-link:hover{
  color: #D2603A;
}
.card-button{
  cursor: pointer;
  float: right;
}
.card-button:hover{
  border-radius: 50%;
  color: #6c757d !important;
}
.card-item-group{
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: 0;
}
.card-item-group > li, ul{
  margin-top: 0;
}
.card-item{
  border-left: none;
  border-right: none;
  padding-left: 2rem;
  position: relative;
  display: block;
  padding: .75rem 2.50rem;
  margin-bottom: -1px;
  background-color: #fff;
  border: 1px solid rgba(0,0,0,.125);
}
</style>
