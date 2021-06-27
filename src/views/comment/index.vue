<script>
export default {
  name: 'comment',
  data () {
    return {
      pathname: ''
    }
  },
  created () {
    this.pathname = this.$route.params.category + '-' + this.$route.params.title + '-comment'
    // console.log(this.pathname)
  },
  render (createELement) {
    return createELement('script', {
      attrs: {
        src: 'https://utteranc.es/client.js',
        repo: 'voidblank/blogComment',
        'issue-term': this.pathname,
        theme: 'github-light',
        crossorigin: 'anonymous',
        async: 'true'
      }
    })
  }
}
</script>
