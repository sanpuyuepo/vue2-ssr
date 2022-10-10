const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const webpack = require('webpack')
const devMiddleware = require('webpack-dev-middleware')
const hotMiddleware = require('webpack-hot-middleware')

const resolve = file => path.resolve(__dirname, file)

module.exports = (server, callback) => {
  let ready
  const onReady = new Promise(r => ready = r)

  // 监视构建 -> 更新 renderer
  let template = null
  let serverBundle = null
  let clientManifest = null

  const update = () => {
    if (template && serverBundle && clientManifest) {
      ready()
      callback(serverBundle, template, clientManifest)
    }
  }

  // 监视构建 template -> 调用 update -> 更新 Renderer 渲染器
  const templatePath = resolve('../index.template.html')
  template = fs.readFileSync(templatePath, 'utf-8')
  update()
  // chokidar: 第三方库
  chokidar.watch(templatePath).on('change', () => {
    template = fs.readFileSync(templatePath, 'utf-8')
    update()
  })

  // 监视构建 serverBundle -> 调用 update -> 更新 Renderer 渲染器
  const serverConfig = require('./webpack.server.config')
  const serverCompiler = webpack(serverConfig)
  const serverMiddleware = devMiddleware(serverCompiler, {
    // webpack-dev-middleware options
    logLevel: 'silent'
  })
  serverCompiler.hooks.done.tap('server', () => {
    serverBundle = JSON.parse(serverMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8'))
    update()
  })
  // serverCompiler.watch({}, (err, stats) => {
  //   if (err) throw err
  //   if (stats.hasErrors()) return
  //   serverBundle = JSON.parse(fs.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8'))
  //   update()
  // })

  // 监视构建 clientManifest -> 调用 update -> 更新 Renderer 渲染器
  const clientConfig = require('./webpack.client.config')
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
  clientConfig.entry.app=[
    'webpack-hot-middleware/client?quiet=true&reload=true',
    clientConfig.entry.app
  ]
  clientConfig.output.filename = '[name].js' // 热更新下确保一致的hash(不使用hash， 直接使用文件名)
  const clientCompiler = webpack(clientConfig)
  const clientMiddleware = devMiddleware(clientCompiler, {
    // webpack-dev-middleware options
    logLevel: 'silent',
    publicPath: clientConfig.output.publicPath
  })
  clientCompiler.hooks.done.tap('client', () => {
    clientManifest = JSON.parse(clientMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-client-manifest.json'), 'utf-8'))
    update()
  })
  server.use(hotMiddleware(clientCompiler, {
    log: false
  }))

  server.use(clientMiddleware)
  return onReady
}