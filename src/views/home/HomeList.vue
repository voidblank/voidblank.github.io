<template>
  <div>
    <div v-for="(post, idx) of postList" class="post-list" :key="idx">
      <h1>
        <a
        @click="$router.push({ name: routeName.post, params: { category: post.category, title: post.routePath }})"
        class="post-title">
          {{ post.title }}
        </a>
      </h1>
      <div class="post-content-div">
        <p class="post-content">{{ post.preview }}</p>
      </div>
      <br/>
      <div>
        <i class="el-icon-date"/>
        <el-tooltip class="item" :effect="$store.getters.isDark ? 'light' : 'dark'" :content="post.modify" placement="bottom">
          <span style="font-size: .875rem;">{{ post.showTime }}</span>
        </el-tooltip>
        <i class="el-icon-chat-line-round" style="margin-left: 1rem;"/>
        <span class="item" style="font-size: .875rem;">{{ post.words }}</span>
      </div>
    </div>
    <el-pagination
      background
      layout="prev, pager, next"
      :page-size="ROW"
      :total="$store.getters.getFileList.length"
      @current-change="changePage"/>
      <pagination/>
  </div>
</template>
<script>
import timeUtil from '../../utils/timeUtil'
import pagination from '../../components/pagination'
export default {
  name: 'homeList',
  components: {pagination},
  data () {
    return {
      page: 0,
      ROW: 7,
      postList: []
    }
  },
  mounted () {
    this.changePage(0)
  },
  methods: {
    /**
     * @param {Number} p
     */
    changePage (p) {
      this.page = Math.max(0, p - 1)
      const tmpList = this.$store.getters.getFileList
      this.postList = tmpList.slice(this.page * this.ROW, Math.min((this.page + 1) * this.ROW, tmpList.length))
      this.postList.forEach(item => {
        item.showTime = timeUtil.getShowTime(item.modifyDate)
      })
      scrollTo(0, 0)
    }
  }
}
</script>
<style scoped>
.post-content-div {
  margin-top: 0.6rem;
  margin-bottom: 0.6rem;
  color: #F3F3F3;
}
.post-content{
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.8;
  overflow-wrap: break-word;
  word-wrap: break-word;
  color: dimgray;
  font-size: 1rem;
  font-size: 16px;
}
.post-list {
  padding-bottom: 1rem;
  border-bottom: 1px solid #F3F3F3;
}
.post-title {
  color: #2A408E;
  cursor: pointer;
  font-size: 1.75rem;
  padding-top: 1.5rem;
  padding-bottom: 1rem;
  font-family: 'Lato', 'Microsoft Yahei', sans-serif;
  font-weight: 400;
  font-size: 22.48px;
}
.post-title:hover{
  color:#D2603A;
}
.post-view {
  padding-top: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #F3F3F3;
}
</style>
