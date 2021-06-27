<template>
<desktop v-if="!$store.state.mode.isMobile"></desktop>
<mobile v-else></mobile>  
</template>
<script>
import Desktop from './Desktop'
import Mobile from './Mobile'
export default {
  name: 'basic',
  components: { Desktop, Mobile }
}
</script>
