const Koa = require('koa')
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const File = require('../../services/file')
const Session = require('../../services/session')
const telegram = require('../../api/telegram')
const config = require('../../../config.json')
const app = new Koa()

router.post('/callback/download', bodyParser(), async function(ctx) {
  const { id, error, response } = ctx.request.body

  ctx.status = 200
  ctx.body = 'ok'

  ctx.res.once('finish', async function () {
    // load session
    const session = await Session.findAndTerminate(id)

    if (session == null) {
      return false
    }

    // error happened
    if (error) {
      let error_message = error.message || 'Can not download your requested media link.'
      return await telegram.sendMessage(session,
        '*savevideobot received an error*: \n\n' + error_message, 'Markdown')
    }

    if (response.file_id != null) {
      return await File.create({
        media_id: response.media_id,
        format: response.format,
        bot: session.bot_name,
        type: response.type,
        file_id: response.file_id
      })
    }
  })
})

module.exports = app.use(router.routes())
