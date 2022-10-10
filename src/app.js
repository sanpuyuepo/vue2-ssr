/**
 * 通用entry
 */

import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router'
import { createStore } from './store'
import VueMeta from 'vue-meta'

Vue.use(VueMeta)

Vue.mixin({
  metaInfo: {
    titleTemplate: '%s - Miura Learning'
  }
})

// 导出一个工厂函数，用于创建新的
// 应用程序、router 和 store 实例
export function createApp () {
  // 创建 router 实例
  const router = createRouter()
  const store = createStore()
  
  const app = new Vue({
    store,
    // 注入 router 到根 Vue 实例
    router,
    // 根实例简单的渲染应用程序组件。
    render: h => h(App)
  })
  return { app, router, store }
}