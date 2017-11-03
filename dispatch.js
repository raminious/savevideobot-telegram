const Koa = require('koa')
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const config = require('./config.json')
const telegram = require('./lib/api/telegram')
const User = require('./lib/api/user')
const Session = require('./lib/services/session')
const _ = require('underscore')
const log = require('./log')

// base path of bot libraries
const libsPath = './lib/bot-command/'

// list of libraries
const libs = {
  'explore'       : require(libsPath + 'explore'),
  'download'      : require(libsPath + 'download'),
  'main'          : require(libsPath + 'main'),
  'connect'       : require(libsPath + 'connect'),
  'ads'           : require(libsPath + 'ads')
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
    lib: 'ads',
    query: '^/ads$',
  },
  {
    lib: 'main',
    query: '.*'
  }
]

router.post('/dispatch/:botId?', bodyParser(), async function (ctx, next) {

  // run dispatcher once received telegram server request
  ctx.res.once('finish', async function () {
    try {
      // parse user request
      await dispatch()
    }
    catch(e) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(e, e.stack)
      }

      // check application fatal errors
      if (e instanceof TypeError || e instanceof ReferenceError) {
        log('fatal', 'telegram_fatal', {
          description: e.message,
          stack: e.stack
        })
      }
    }
  })

  ctx.status = 200
  ctx.body = {}

  /**
  * entry point of parsing user request
  */
  const dispatch = async function (){

    const req = this.request.body
    const botId = this.params.botId // is equivalent to owner user _id

    // get user message
    let chat_id, message_id, message, type = null

    if (req.message != null) {
      type = 'message'
      message_id = req.update_id.toString() + req.message.message_id.toString()
      chat_id = req.message.chat.id
      message = req.message.text
    }
    else if (req.callback_query != null) {
      type = 'callback_query'
      message_id = req.update_id.toString() + req.callback_query.message.message_id.toString()
      chat_id = req.callback_query.message.chat.id
      message = req.callback_query.data
    }
    else {
      return false
    }

    // avoid to process unknown commands
    if (message == null) {
      return false
    }

    // trim message
    message = message.trim()

    // check if message is a retry request
    if (/^\/retry\d+/.test(message)) {
      let session_id = message.match(/\d+/)[0]
      let retry = await Session.findAndTerminate(session_id)

      if (retry != null) {
        message = retry.message
      }
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
    const identity = await User.getIdentity(user)

    // if message is sent from group, response back to group instead user
    if (chat_id != identity.id) {
      identity.chat_id = chat_id
    } else {
      identity.chat_id = identity.id
    }

    /*
    * get bot token if client using own bot
    * send from groups not supproted (identity.id == chat_id)
    */
    if (botId && identity.id == chat_id) {

      // only bot owner can use the bot
      if (identity._id != botId) {
        return false
      }

      identity.bot.pipe = true
    }

    // find api depend on user request
    const command = _.detect(commands, (item) => {
      return message.match(item.query) != null
    })

    // store user request as session
    const session = await Session.store(message_id, identity, message, command.ttl)

    return await libs[command.lib](session, message)

  }.bind(ctx)
})

const app = new Koa()
module.exports = app.use(router.routes())
