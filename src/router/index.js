import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'

Vue.use(Router)

export function createRouter () {
  return new Router({
    mode: 'history', //^ 同构应用兼容前后端， 只能使用 history 模式
    routes: [
      // ...
      {
        path: '/',
        name: 'home',
        component: Home
      }, 
      {
        path: '/about',
        name: 'about',
        component: () => import('@/pages/About') // 异步组件， 分割成独立的chunk
      },
      {
        path: '/posts',
        name: 'posts',
        component: () => import('@/pages/Posts') // 异步组件， 分割成独立的chunk
      },
      {
        path: '*',
        name: 'error404',
        component: () => import('@/pages/404') // 异步组件， 分割成独立的chunk
      }
    ]
  })
}