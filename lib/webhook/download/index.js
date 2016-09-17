'use strict'

const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const file = require('../../database/file')
const config = require('../../../config.json')
const telegram = require('../../resources/telegram')(config.token)

router.post('/webhook/download', bodyParser(), function* () {

  const req = this.request.body

  // error occured
  if (req.status == -1) {
    return yield telegram.sendMessage(req.user_id,
      '@savevideobot faced an error: \n\n *' + req.error + '*', 'Markdown')
  }

  yield file.create({
    media_id: req.media_id,
    url: req.url,
    type: req.type,
    format: req.format,
    file_id: req.file_id,
  })

  this.body = {}
})

module.exports = require('koa')().use(router.routes())
