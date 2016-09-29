'use strict'

const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const config = require('./config.json')
const co = require('co')
const telegram = require('./lib/resources/telegram')
const User = require('./lib/database/user')
const Session = require('./lib/database/session')
const _ = require('underscore')
const log = require('./log')

// base path of bot libraries
const libsPath = './lib/bot-command/'

// list of libraries
const libs = {
  'explore'   : require(libsPath + 'explore'),
  'download'  : require(libsPath + 'download'),
  'random'    : require(libsPath + 'random'),
  'main'      : require(libsPath + 'main'),
  'connect'   : require(libsPath + 'connect')
}

const commands = [
  {
    lib: 'explore',
    query: /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi,
    ttl: config.session.ttl
  },
  {
    lib: 'download',
    query: '^/[a-zA-Z0-9]{25,27}',
    ttl: config.session.ttl
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
    lib: 'connect',
    query: '^/(dis)?connect$'
  },
  {
    lib: 'connect',
    query: /^\d+:[\w&.\-]*$/
  },
  {
    lib: 'main',
    query: '.*'
  }
]

router.post('/dispatch/:botId?', bodyParser(), function* (next) {

  // run dispatcher once received telegram server request
  this.res.once('finish', co.wrap(function* () {
    try {
      // parse user request
      yield dispatch()
    }
    catch(e) {

      if (process.env.NODE_ENV !== 'production')
        console.log(e, e.stack)

      // check application fatal errors
      if (e instanceof TypeError || e instanceof ReferenceError)
        log('fatal', 'telegram_fatal', { description: e.message, stack: e.stack })
    }
  }))

  this.status = 200
  this.body = {}

  /**
  * entry point of parsing user request
  */
  const dispatch = function* (){

    const req = this.request.body
    const botId = this.params.botId // is equivalent to owner user _id

    // get user message
    let id, message, type = null

    if (req.message != null) {
      type = 'message'
      id = req.update_id.toString() + req.message.message_id.toString()
      message = req.message.text
    }
    else if (req.callback_query != null) {
      type = 'callback_query'
      id = req.update_id.toString() + req.callback_query.message.message_id.toString()
      message = req.callback_query.data
    }
    else
      return false

    // avoid to process unknown commands
    if (message == null)
      return false

    // trim message
    message = message.trim()

    // check if message is a retry request
    if (/^\/retry\d+/.test(message)) {
      let session_id = message.match(/\d+/)[0]
      let retry = yield Session.findAndTerminate(session_id)

      if (retry != null)
        message = retry.message
    }

    // create user identity object
    const user = {
      id: req[type].from.id,
      name: ((req[type].from.first_name || '') + ' ' + (req[type].from.last_name || '')).trim(),
      username: req[type].from.username || ''
    }

    /*
    * get user identity
    * auto signup is enabled
    */
    const identity = yield User.getIdentity(user)

    /*
    * get bot token if client using own bot
    */
    if (botId != null) {

      // only bot owner can use the bot
      if (identity._id != botId)
        return false

      identity.bot.pipe = true
    }

    // find api depend on user request
    const command = _.detect(commands, (item) => {
      return message.match(item.query) != null
    })

    // store user request as session
    const session = yield Session.store(id, identity, message, command.ttl)

    return yield libs[command.lib](session, message)

  }.bind(this)
})

module.exports = require('koa')().use(router.routes())
