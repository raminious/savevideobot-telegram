const responseTime = require('koa-response-time')
const ratelimit = require('koa-ratelimit')
const compress = require('koa-compress')
const mount = require('koa-mount')
const Koa = require('koa')

module.exports = function bot() {
  const app = new Koa()

  // trust proxy
  app.proxy = true

  // entry point
  app.use(mount('/bot', require('./dispatch')))

  // callback
  app.use(mount('/bot', require('./lib/callback/download')))
  app.use(mount('/bot', require('./lib/callback/explore')))

  return app
}
