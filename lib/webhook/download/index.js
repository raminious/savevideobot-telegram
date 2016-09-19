'use strict'

const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const file = require('../../database/file')
const config = require('../../../config.json')
const telegram = require('../../resources/telegram')

router.post('/webhook/download', bodyParser(), function* () {

  const req = this.request.body

  const user = {
    id: req.user_id,
    botToken: req.bot_token
  }

  // error occured
  if (req.status == -1)
    return yield telegram.sendMessage(user,
      '@savevideobot faced an error: \n\n *' + req.error + '*', 'Markdown')

  if (req.file_id != null) {

    yield file.create({
      media_id: req.media_id,
      url: req.url,
      type: req.type,
      format: req.format,
      file_id: req.file_id,
      bot: req.bot_name
    })
  }

  this.body = {}
})

module.exports = require('koa')().use(router.routes())
