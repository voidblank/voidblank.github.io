import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const routeName = {
  home: 'homePage',
  post: 'post',
  category: 'category',
  tag: 'tag',
  tags: 'tags',
  achieve: 'achieve',
  about: 'about'
}

const path = {
  root: '/',
  home: '/home',
  post: '/post/:category/:title',
  category: '/category',
  tag: '/tag',
  achieve: '/achieve',
  about: '/about'
}

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: path.root,
      name: 'home',
      components: {
        desktop: () => import('@/views/basic/Desktop'),
        mobile: () => import('@/views/basic/Mobile')
      },
      redirect: path.home,
      children: [
        {
          path: path.home,
          name: routeName.home,
          components: {
            desktop: () => import('@/views/home/Desktop'),
            mobile: () => import('@/views/home/Mobile')
          }
        },
        {
          path: '/post/:category/:title',
          name: routeName.post,
          props: {
            desktop: true,
            mobile: true
          },
          components: {
            desktop: () => import('@/views/posts/Desktop'),
            mobile: () => import('@/views/posts/Mobile')
          }
        },
        {
          path: path.category,
          name: routeName.category,
          components: {
            desktop: () => import('@/views/category/Desktop'),
            mobile: () => import('@/views/category/Mobile')
          }
        },
        {
          path: path.tag,
          name: routeName.tag,
          components: {
            desktop: () => import('@/views/tag/Desktop'),
            mobile: () => import('@/views/tag/Mobile')
          }
        },
        {
          path: path.achieve,
          name: routeName.achieve,
          components: {
            desktop: () => import('@/views/achieve/Desktop'),
            mobile: () => import('@/views/achieve/Mobile')
          }
        },
        {
          path: path.about,
          name: routeName.about,
          components: {
            desktop: () => import('@/views/about/Desktop'),
            mobile: () => import('@/views/about/Mobile')
          }
        }
      ]
    }
  ]
})

export default {
  router,
  routeName
}
