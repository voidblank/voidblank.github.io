<template>
<div>
  <div v-for="idx in total" :key="idx" class="p-button">
    <a @click="currentChange(idx)">{{ idx }}</a>
  </div>
</div>
</template>
<script>
export default {
  name: 'pagination',
  props: {
    current: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    },
    total: {
      type: Number,
      default: 0
    },
    showQuickJump: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      pData: {}
    }
  },
  watch: {
    current: {
      handler () {
        this.pData.current = this.current <= 0 ? 1 : this.current
      }
    },
    pageSize: {
      handler () {
        this.pData.pageSize = this.pageSize <= 0 ? 10 : this.pageSize
      }
    },
    total: {
      handler () {
        this.pData.total = Math.max(0, this.total)
      }
    },
    showQuickJump: {
      handler () {
        this.pData.showQuickJump = this.showQuickJump
      }
    }
  },
  created () {
    this.pData = {
      current: this.current <= 0 ? 1 : this.current,
      pageSize: this.pageSize <= 0 ? 10 : this.pageSize,
      total: Math.max(0, this.total),
      showQuickJump: this.showQuickJump
    }
  },
  mounted () {

  },
  methods: {
    currentChange (p) {
      this.$emit('change', p)
    }
  }
}
</script>
<style scoped>
.p-button{
  display: inline-block;
}
</style>
