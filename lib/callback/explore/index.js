'use strict'

const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const co = require('co')
const Session = require('../../database/session')
const telegram = require('../../resources/telegram')
const display = require('../../resources/media').display
const config = require('../../../config.json')

router.post('/callback/explore', bodyParser(), function* () {

  const req = this.request.body

  this.status = 200
  this.body = 'ok'

  this.res.once('finish', co.wrap(function* () {

    const session = yield Session.parse(req.callback.data)

    if (session == null)
      return false

    if (req.error)
      return yield telegram.sendMessage(session, req.error.message, 'Markdown')

    // display media
    return yield display(session, req.media)
  }))
})

module.exports = require('koa')().use(router.routes())
