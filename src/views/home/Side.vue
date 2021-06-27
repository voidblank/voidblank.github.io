<template>
  <div class="side-item">
    <calendar :start-year="startYear" :end-year="endYear" :labels="$store.state.md.labelDays"/>
  </div>
</template>
<script>
import calendar from '@/components/calendar/'
export default {
  name: 'homeSide',
  components: {calendar},
  data () {
    return {
      startYear: 1949,
      endYear: 2050
    }
  }
}
</script>
<style scoped>
.side-item{
  padding-left: 1rem;
  border-left: 1px solid #f3f3f3;
  position: fixed;
}
</style>
