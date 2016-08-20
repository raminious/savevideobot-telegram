const responseTime = require('koa-response-time');
const ratelimit = require('koa-ratelimit');
const compress = require('koa-compress');
const mount = require('koa-mount');
const koa = require('koa');

module.exports = function bot() {

  const app = koa();

  // trust proxy
  app.proxy = true;

  //routes
  app.use(mount('/bot',require('./dispatch')));
  app.use(mount('/bot',require('./lib/webhook/download')));

  return app;
}
