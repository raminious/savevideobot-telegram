'use strict'

const telegram = require('../../resources/telegram')
const connector = require('../../resources/connect')
const User = require('../../database/user')

module.exports = function* (session, message) {

  const commands = {
    '/connect'    : connect,
    '/disconnect' : disconnect
  }

  // get bot command { connect, disconnect, token }
  const command = commands[message] || token

  // run command
  yield command(session, message)
}

/**
* Connect new bot to savevideobot
*/
const connect = function* (session) {

  let text = []

  const bot = session.user_bot

  if (bot) {
    text = [
      'You have already connected @' + bot.username + '\n',
      'To connect new bot, first you must send /disconnect to unlink ',
      '<b>' + bot.username + '</b>'
    ]
  }
  else {
    text = [
      '<b>It seems you want to connect your bot to @savevideobot</b>.\n',
      '<b>Send your bot token to continue ...</b>\n\n',
      '( bot tokens are something like: 113197456:AAG3gA1k1VCJsL5Zf2yukwUpSujx0eeEX5M )\n\n',
      '<b>How do I create a bot ?</b>\n',
      'Just read this article: ',
      '<a href="https://core.telegram.org/bots#6-botfather">How to create a bot with @botfather</a>\n\n',
      '<b>How to use botfather ?</b>\n',
      'https://telegram.me/botfather\n'
    ]
  }

  yield telegram.sendMessage(session, text.join(''), 'HTML', true)
}

/**
* disConnect bot
*/
const disconnect = function* (session) {

  const bot = session.user_bot

  if (!bot)
    return yield telegram.sendMessage(session, 'You have not any bot to disconnect.', 'HTML', true)

  yield connector.delWebhook(bot.token)
  yield User.removeBot(session.user_id)
  yield telegram.sendMessage(session, '@' + bot.username + ' has been disconnected.', 'HTML', true)
}

/**
* set new bot token
*/
const token = function* (session, token) {

  let info
  let text

  const bot = session.user_bot

  if (bot) {
    
    text = [
      'You have already connected @' + bot.username + '\n',
      'To connect new bot, first you must send /disconnect to unlink ',
      '<b>' + bot.username + '</b>'
    ]

    return yield telegram.sendMessage(session, text.join(''), 'HTML', true)
  }

  try {
    info = yield connector.info(token)
    text = '@' + info.result.username + ' has been connected to @savevideobot'

    yield connector.setWebhook(session.user, token)
    yield User.addBot(session.user_id, token, info.result)
  }
  catch(e) {
    text = [
      '<b>Invalid bot token</b>\n\n',
      'Telegram response: \n',
      e.response.body.description
    ].join('')
  }

  yield telegram.sendMessage(session, text, 'HTML', true)
}
