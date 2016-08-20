'use strict'

const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const file = require('../../database/file')

router.post('/webhook/download', bodyParser(), function* () {

  const req = this.request.body

  yield file.create({
    media_id: req.media_id,
    url: req.url,
    type: req.type,
    format: req.format,
    file_id: req.file_id,
  })

  this.body = 'ok'
})

module.exports = require('koa')().use(router.routes())
