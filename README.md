# koa2
## 项目初始化
```
npm init -y
```
## 安装koa @koa/router
```
yarn add koa @koa/router
```
## 初始化应用
根目录下创建src目录，src下创建index.js文件
```javascript
const Koa = require('koa')
const Router = require('@koa/router')

const app = new Koa()
const router = new Router()
router.get('/', ctx => {
  ctx.body = 'hello word'
})
app.use(router.routes()).use(router.allowedMethods())
app.listen(3000)
```
## 添加常用中间件
* koa-combine-routers 合并、压缩路由
* koa-json 数据格式化
* koa-body 协议处理
* koa-cors 跨域处理
* koa-static 静态资源
* koa-helmet 请求头安全处理
```javascript
const Koa = require('koa')
const path = require('path')
<!--// const Router = require('@koa/router')-->
const koaBody = require('koa-body')
const cors = require('@koa/cors')
const helmet = require('koa-helmet')
const static = require('koa-static')

const app = new Koa()

const router = new Router()
const router = new Router()
router.get('/', ctx => {
  ctx.body = 'hello word'
})

app.use(koaBody())
app.use(cors())
app.use(helmet())
app.use(static(path.join(__dirname, '../public')))
app.use(router.routes()).use(router.allowedMethods())

app.listen(3000)
```

## 合并路由
src下创建api目录，api下创建a.js
```javascript
const a = function (ctx) {
  ctx.body = 'hello from a'
}

module.exports = {
  a
}
```
src下创建routes目录，routes目录下创建aRouter.js
```javascript
const Router = require('@koa/router')

const { a } = require('../api/a')

const router = new Router()

router.get('/a', a)

module.exports = router

```
routes目录下创建，routes.js
```javascript
const comibineRouter = require('koa-combine-routers')

const aRoutes = require('./aRouter')

const router = comibineRouter(
  aRoutes
}
module.exports = router

```
修改src/index.js中路由引用
```javascript
const Koa = require('koa')
const path = require('path')
// const Router = require('@koa/router')
const koaBody = require('koa-body')
const cors = require('@koa/cors')
const router = require('./routes/routes')
const helmet = require('koa-helmet')
const static = require('koa-static')

// const router = new Router()

const app = new Koa()

app.use(koaBody())
app.use(cors())
app.use(helmet())
app.use(static(path.join(__dirname, '../public')))
app.use(router())

app.listen(3000)
```
## 热加载
安装依赖
```
yarn add nodemon
```
配置启动命令
```json
// package.json
{
    ...
    "scripts": {
        "start": "nodemon ./src/index.js",
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    ...
}
```
## es6支持
> 通过webpack+babel实现

### 安装依赖
```
yarn add webpack webpack-cli clean-webpack-plugin webpack-node-externals @babel/core @babel/node @babel/preset-env babel-loader cross-env --dev
```
依赖解读
* clean-webpack-plugin 清理dist目录下的文件
* webpack-node-externals 对node-modules进行排除处理
* @babel/core babel的核心
* @babel/node 调试用
* @babel/preset-env 对新特性的支持
* babel-loader webpack中使用到的loader
* cross-env 环境变量

### 配置webpack
#### 根目录下创建webpack.config.js
```javascript
const path = require('path')
const nodeExcternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const webpackconfig = {
  target: 'node',
  mode: 'development',
  entry: {
    server: path.join(__dirname, 'src/index.js')
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, './dist')
  },
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader'
        },
        exclude: [path.join(__dirname, '/node_modules')]
      }
    ]
  },
  externals: [nodeExcternals()],
  plugins: [
    new CleanWebpackPlugin()
  ],
  node: {
    console: true,
    global: true,
    process: true,
    Buffer: true,
    __filename: true,
    __dirname: true,
    setImmediate: true,
    path: true
  }
}

module.exports = webpackconfig

```
#### package.json配置启动命令
```
{
    ...
    "scripts": {
        "start": "nodemon ./src/index.js",
        "serve": "nodemon --exec babel-node src/index.js",
        "test": "echo \"Error: no test specified\" && exit 1"
    },
     ...
}
```

## webpack调试
### 方式一 console.log
在webpack.config.js中，通过console.log来调试
### 方式二 通过node
```
npx node --inspect-bark ./node_modules/.bin/webpack --inline --progress  --config config文件目录

// 谷歌浏览器地址栏输入 chrome://inspect
```
### 方式三 vs code
* 进入debugger模块
* 添加配置
```
// .vscode launch.json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "name": "nodemon",
      // "program": "${workspaceFolder}/app.js",
      "program": "${workspaceFolder}/src/index.js",
      "request": "launch",
      "restart": true,
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/nodemon",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "type": "pwa-node"
    }
  ]
}
```
## 使用koa-compose整合中间件
```javascript
import koa from 'koa'
import path from 'path'
import router from './routes/routes'
import koaBody from 'koa-body'
import jsonutil from 'koa-json'
import cors from '@koa/cors'
import compose from 'koa-compose'
import statics from 'koa-static'
import helmet from 'koa-helmet'

const app = new koa()

const middleware = compose([
  koaBody(),
  statics(path.join(__dirname, '../public')),
  cors(),
  jsonutil({pretty: false, param: 'pretty'}),
  helmet()
])

app.use(middleware)
app.use(router())

app.listen(3000)
```

## 打包构建
### 安装依赖
```
yarn add webpack-merge terser-webpack-plugin --dev
```
### 注意各依赖版本
```json
// package.json
{
  ...
  "devDependencies": {
    "@babel/core": "^7.12.3",
    "@babel/node": "^7.12.1",
    "@babel/preset-env": "^7.12.1",
    "@types/clean-webpack-plugin": "^0.1.3",
    "@types/terser-webpack-plugin": "^5.0.0",
    "@types/webpack": "^4.41.22",
    "@types/webpack-merge": "^4.1.5",
    "@types/webpack-node-externals": "^2.5.0",
    "babel-loader": "^8.1.0",
    "clean-webpack-plugin": "^3.0.0",
    "cross-env": "^7.0.2",
    "nodemon": "^2.0.5",
    "terser-webpack-plugin": "^1.4.0",
    "webpack": "^4.39.1",
    "webpack-cli": "^3.3.6",
    "webpack-merge": "^4.2.0",
    "webpack-node-externals": "^1.7.2"
  }
  ...
}
```
### 创建配置文件
项目根目录下，创建build文件目录，将根目录下的webpack.config.js拷贝至build目录下，并重命名位webpack.config.base.js，注意内部路径的变更。

build目录下，新建uitls.js处理路径：
```javascript
const path = require('path')

exports.resolve = function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

exports.APP_PATH = exports.resolve('src')

exports.DIST_PATH = exports.resolve('dist')
```

webpack.config.base.js
```javascript
const path = require('path')
const utils = require('./utils')
const nodeExcternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')

const webpackconfig = {
  target: 'node',
  entry: {
    server: path.join(utils.APP_PATH, 'index.js')
  },
  output: {
    filename: '[name].bundle.js',
    path: utils.DIST_PATH
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader'
        },
        exclude: [path.join(__dirname, '/node_modules')]
      }
    ]
  },
  externals: [nodeExcternals()],
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod') ? "'production'" : "'development'"
      }
    })
  ],
  node: {
    console: true,
    global: true,
    process: true,
    Buffer: true,
    __filename: true,
    __dirname: true,
    setImmediate: true,
    path: true
  }
}

module.exports = webpackconfig

```
webpack.config.dev.js
```javascript
const webpackMerge = require('webpack-merge')

const baseWebpackConfig = require('./webpack.config.base')

const webpackConfig = webpackMerge(baseWebpackConfig, {
  devtool: 'eval-source-map',
  mode: 'development',
  stats: {
    children: false
  }
})

module.exports = webpackConfig

```

webpack.config.prod.js
```javascript
const webpackMerge = require('webpack-merge')

const baseWebpackConfig = require('./webpack.config.base')

const TerserWebpackPlugin = require('terser-webpack-plugin')

const webpackConfig = webpackMerge(baseWebpackConfig, {
  mode: 'production',
  stats: {
    children: false,
    warnings: false
  },
  optimization: {
    minimizer: [
      new TerserWebpackPlugin({
        terserOptions: {
          warnings: false,
          compress: {
            warnings: false,
            drop_console: false,
            dead_code: true,
            drop_debugger: true
          },
          output: {
            comments: false,
            beautify: false
          },
          mangle: true
        },
        parallel: true
      })
    ],
    splitChunks: {
      cacheGroups: {
        comments: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 3,
          enforce: true
        }
      }
    }
  }
})

module.exports = webpackConfig

```
配置打包、启动命令
```
    yarn add rimraf --dev
```
```
// package.json
{
  ...
  "scripts": {  
    "start": "nodemon ./src/index.js",
    "build": "cross-env NODE_ENV=prod webpack --config config/webpack.config.prod.js",
    "serve": "nodemon --exec babel-node src/index.js",
    "dev": "cross-env NODE_ENV=development nodemon --exec babel-node --inspect ./src/index.js",
    "clean": "rimraf dist",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
  ...
}
```

## 代码优化
见代码库

## 其他
### 使用ncu检测npm包版本
#### 安装
```
npm i -g npm-check-updates
```
