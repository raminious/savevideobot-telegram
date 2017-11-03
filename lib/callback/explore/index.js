const Koa = require('koa')
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const Session = require('../../services/session')
const telegram = require('../../api/telegram')
const display = require('../../api/media').display
const config = require('../../../config.json')
const app = new Koa()

router.post('/callback/explore', bodyParser(), async function (ctx) {
  const { id, error, media } = ctx.request.body

  ctx.status = 200
  ctx.body = 'ok'

  ctx.res.once('finish', async function () {

    // load session - (decide to terminate after media display)
    const session = await Session.find(id)

    if (session == null) {
      return false
    }

    if (error) {
      return await telegram.sendMessage(session, error.message, 'Markdown')
    }

    // display media
    return await display(session, media)
  })
})

module.exports = app.use(router.routes())
