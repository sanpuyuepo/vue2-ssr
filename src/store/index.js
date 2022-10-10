import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export function createStore () {
  return new Vuex.Store({
    state: () => ({
      posts: []
    }),
    actions: {
      // 服务端渲染务必让 action 返回一个promise
      async getPosts ({commit}) {
        const { data } = await axios.get('https://cnodejs.org/api/v1/topics')
        commit('setPosts', data.data)
      }
    },
    mutations: {
      setPosts (state, payload) {
        state.posts = payload
      }
    }
  })
}