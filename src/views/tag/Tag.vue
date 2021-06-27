<template>
  <div>
    <div class="page-title">Tag</div>
    <div>
      <div v-for="(item, index) of Object.keys(tags)" :key="index" class="d">
        <span class="tag">
          {{ item }}
          <span class="tag-cnt">
          {{ tags[item].length }}
        </span>
        </span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'tag',
  data () {
    return {
      tags: this.$store.state.md.tag
    }
  }
}
</script>
<style>
.tag{
  border-radius: 0.7em;
  padding: 6px 8px 7px;
  margin-right: 0.8rem;
  line-height: 3rem;
  letter-spacing: 0;
  border: 1px solid #DEE2D6 !important;
  box-shadow: 0 0 3px 0 #E9ECEF;
  color: #2A408E;
  cursor: pointer;
}
.tag:hover{
  color: #D2603A;
}
.tag-cnt{
  color: #6c757d!important;
}
.d{
  display: inline-block;
}
</style>
