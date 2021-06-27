<template>
  <div>
    <post :title="title" :category="category"/>
  </div>
</template>
<script>
import Post from './Post.vue'
export default {
  name: 'MobilePost',
  components: { Post },
  props: {
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    }
  }
}
</script>
