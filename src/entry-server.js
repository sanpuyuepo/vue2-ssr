import { createApp } from './app'

// export default context => {
//   // const { app } = createApp()
//   // return app

//   return new Promise((resolve, reject) => {
//     const { app, router } = createApp()

//     // 设置服务器端 router 的位置
//     router.push(context.url)

//     // 等到 router 将可能的异步组件和钩子函数解析完
//     router.onReady(() => {
//       // 已配置404页面，就不需要下面的代码了
//       const matchedComponents = router.getMatchedComponents()
//       // 匹配不到的路由，执行 reject 函数，并返回 404
//       if (!matchedComponents.length) {
//         return reject({ code: 404 })
//       }

//       // Promise 应该 resolve 应用程序实例，以便它可以渲染
//       resolve(app)
//     }, reject)
//   })
// }

// 修改一下， 清爽一点：
export default async context => {
  const { app, router, store } = createApp()

  const meta = app.$meta() 

  // 设置服务器端 router 的位置
  router.push(context.url)

  context.meta = meta

  // 等到 router 将可能的异步组件和钩子函数解析完
  new Promise(router.onReady.bind(router)) // bind 确保 this 指向

  context.rendered = () => {
    context.state = store.state
  }

  return app
}