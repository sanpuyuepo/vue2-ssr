const Vue = require('vue')
const express = require('express')
const fs = require('fs')

const { createBundleRenderer } = require('vue-server-renderer')
const setupDevServer = require('./build/set-dev-server')

const server = express()

// ^ main
server.use('/dist', express.static('./dist'))

const isProd = process.env.NODE_ENV === 'production'

let renderer = null
let onReady = null

if (isProd) {
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')
  const serverBundle = require('./dist/vue-ssr-server-bundle.json')
  const template = fs.readFileSync('./index.template.html', 'utf-8')
  renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest 
  })
} else {
  // 开发模式：监视打包构建 --> 重新生成 renderer
  onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
    renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest
    })
  })
}

const render = async (req, res) => {
  try {
    // "渲染上下文对象"，作为 renderToString 函数的第二个参数，来提供插值数据
    const context = {
      url: req.url,
      title: 'Hello Miura~~~',
      meta: `<meta name="description" content="vue srr demo">`
    }

    const html = await renderer.renderToString(context)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(html)
  } catch (err) {
    res.status(500).end('Internal Server Error')
  }
}

server.get('*', isProd ? render : async (req, res) => {
  await onReady
  render(req, res)
})

server.listen(3000, () => {
  console.log('server running at port 3000')
})
