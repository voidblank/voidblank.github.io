<template>
  <div class="side">
    <el-avatar :size="100" :src="avatar" @error="imgError" icon="el-icon-user-solid" style="margin-top: 3.5rem;"/>
    <div class="username">{{ username }}</div>
    <div class="subtitle">just a blog!</div>
    <ul class="w-100">
      <li v-for="(item, index) of sideBarTable" :key="index" class="nav-item" :class="{ 'nav-link': item.isActive }" @click="toPage(item)">
        <a>{{ item.title }}</a>
      </li>
    </ul>
    <div>
      <template v-for="(item, index) of icons">
        <el-tooltip class="item" :effect="$store.getters.isDark ? 'light' : 'dark'" :content="item.name" placement="top" :key="index + '-tooltip'">
          <img :key="index + '-img'" :src="item.img" class="icons" :style="item.style" @click="item.click(item)"/>
        </el-tooltip>
      </template>
    </div>
  </div>
</template>
<script>
export default {
  name: 'side',
  data () {
    return {
      sideBarTable: [
        {
          title: 'HOME',
          link: this.routeName.home,
          isActive: false
        },
        {
          title: 'CATEGORY',
          link: this.routeName.category,
          isActive: false
        },
        {
          title: 'TAG',
          link: this.routeName.tag,
          isActive: false
        },
        {
          title: 'ACHIEVE',
          link: this.routeName.achieve,
          isActive: false
        },
        {
          title: 'ABOUT',
          link: this.routeName.about,
          isActive: false
        }
      ],
      avatar: 'https://imgur.com/oEa1xeJ.jpg',
      username: 'voidblank',
      icons: [
        {
          name: 'contrast',
          img: require('../../assets/icon/contrast.svg'),
          style: {
            'transform': 'none'
          },
          click: (item) => {
            item.style.transform = item.style.transform === 'none' ? 'rotateY(180deg)' : 'none'
            this.$store.commit('changeAllStyle')
          }
        },
        {
          name: 'github',
          img: require('../../assets/icon/github.svg'),
          click: () => {
            window.open('https://github.com/voidblank')
          }
        },
        {
          name: 'email',
          img: require('../../assets/icon/email.svg'),
          click: () => {
            window.location.href = 'mailto:' + ['cy1245171920', 'outlook.com'].join('@')
          }
        }
      ]
    }
  },
  watch: {
    '$route': {
      handler () {
        this.traversal()
      }
    }
  },
  mounted () {
    this.traversal()
  },
  methods: {
    /**
     * @param {{title: string, link: string}} item
     */
    toPage (item) {
      if (this.$route.name !== item.link) {
        this.$router.push({ name: item.link })
      }
    },
    traversal () {
      this.sideBarTable.forEach(item => {
        item.isActive = this.$route.name === item.link
      })
    },
    imgError () {
      return 'el-icon-user-solid'
    }
  }
}
</script>
<style>
.side{
  background-image: radial-gradient( circle, rgba(42, 30, 107, 1) 0%, rgba(35, 37, 46, 1) 100%);
  position: fixed;
  text-align: center;
  height: 100%;
}
.username{
  margin-top: 1rem!important;
  font-weight: 900;
  font-size: 1.5rem;
  letter-spacing: 0.5px;
  color: #FFFFFF80;
  user-select: none;
}
.subtitle{
  font-size: 95%;
  color: #828282;
  line-height: 1.2rem;
  word-spacing: 1px;
  margin: 0.5rem 1.5rem 0.5rem 1.5rem;
  min-height: 3rem;
  user-select: none;
  font-style: italic!important;
}
.w-100{
  width: 100%!important;
  padding: 0;
}
.nav-item{
  display: table;
  user-select: none;
  color: #FFFFFF80;
  height: 3.2rem;
  width: 100%;
  border-radius: 0;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 1px;
  vertical-align: middle;
}
.nav-item:hover{
  color: #F8F9FACF;
  cursor: pointer;
}
.nav-item > a:hover{
  color: #F8F9FACF;
}
.nav-link{
  color: #FCFCFC;
}
.icons{
  width: 1.75rem;
  height: 1.75rem;
  padding: 0.68rem;
  filter: contrast(0.0);
  cursor: pointer;
}
</style>
