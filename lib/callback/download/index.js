'use strict'

const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const co = require('co')
const File = require('../../database/file')
const Session = require('../../database/session')
const telegram = require('../../resources/telegram')
const advertisement = require('../../resources/advertisement')
const config = require('../../../config.json')

router.post('/callback/download', bodyParser(), function* () {

  const req = this.request.body
  const id = req.id
  const response = req.response

  this.status = 200
  this.body = 'ok'

  this.res.once('finish', co.wrap(function* () {

    // load session
    const session = yield Session.findAndTerminate(id)

    if (session == null)
      return false

    // error happened
    if (req.error) {
      let error_message = req.error.message || 'Can not download your requested media link.'
      return yield telegram.sendMessage(session,
        '*savevideobot received an error*: \n\n' + error_message, 'Markdown')
    }

    advertisement.display(session)

    if (response.file_id != null) {
      return yield File.create({
        media_id: response.media_id,
        url: response.url,
        type: response.type,
        format: response.format,
        file_id: response.file_id,
        bot: session.bot_name
      })
    }
  }))
})

module.exports = require('koa')().use(router.routes())
