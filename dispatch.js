'use strict'

const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const request = require('superagent')
const config = require('./config.json')
const co = require('co')
const telegram = require('./lib/resources/telegram')(config.token)
const User = require('./lib/database/user')
const _ = require('underscore')


const commands = [
  {
    lib: 'request',
    query: /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi
  },
  {
    lib: 'download',
    query: '^/[a-zA-Z0-9]{25,27}'
  },
  {
    lib: 'random',
    query: '^/random$'
  },
  {
    lib: 'main',
    query: '^/help$'
  },
  {
    lib: 'main',
    query: '.*'
  }
]

router.post('/dispatch', bodyParser(), function* (next) {

  // run dispatcher when response is sent to user
  this.res.once('finish', co.wrap(function* () {
    try {
      yield dispatch()
    }
    catch(e) {
      console.log(e)
      log('error', e.message, e.info)
    }
  }))

  // dispatch function
  const dispatch = function* (){

    const req = this.request.body

    // get user message
    let message, type = null

    if (req.message != null) {
      type = 'message'
      message = req.message.text.trim()
    }

    if (req.callback_query != null) {
      type = 'callback_query'
      message = req.callback_query.data.trim();
    }

    // dont process unknown commands
    if (message == null)
      return false;


    const user = {
      id: req[type].from.id,
      name: ((req[type].from.first_name || '') + ' ' + (req[type].from.last_name || '')).trim(),
      username: req[type].from.username || ''
    }

    /*
    * get user identity
    * create new identity from api server if user is new
    */
    const identity = yield User.getIdentity(user)

    // find api depend on user request
    const command = _.detect(commands, (item) => {
      return message.match(item.query) != null
    })

    return yield require('./lib/bot-command/' + command.lib)(identity, message)

  }.bind(this)

  // logger
  const log = function (level, message, e) {

    let log = config.log

    request
      .post(log.url)
      .auth(log.auth.username, log.auth.password, { type: 'auto' })
      .send({
        level,
        short_message: message,
        from: 'telegram'
      })
      .send(e)
      .end((err, res) => {})
  }


  this.status = 200
  this.body = 'ok'
})


module.exports = require('koa')().use(router.routes())
