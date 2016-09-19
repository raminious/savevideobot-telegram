'use strict'

const request = require('superagent')
const config = require('../../../config.json')
const telegram = require('../../resources/telegram')
const connector = require('../../resources/connect')
const User = require('../../database/user')

module.exports = function* (user, message) {

  const commands = {
    '/connect': connect,
    '/disconnect': disconnect
  }

  const command = commands[message] || token

  yield command(user, message)
}

/**
* Connect new bot to savevideobot
*/
const connect = function* (user) {

  let text = []

  if (user.bot != null) {
    text = [
      'You have connected @' + user.bot.username + ' before.\n',
      'If you want to connect your new bot, you must send /disconnect to unlink ',
      '<b>' + user.bot.username + '</b> first.'
    ]
  }
  else {
    text = [
      '<b>Okay. You want to connect your bot to @savevideobot</b>.\n',
      '<b>Send your bot token to continue ...</b>\n\n',
      '( bot tokens are something like 113197456:AAG3gA1k1VCJsL5Zf2yukwUpSujx0eeEX5M )\n\n',
      '<b>How do I create a bot ?</b>\n',
      'Just read this article: ',
      '<a href="https://core.telegram.org/bots#6-botfather">How to create a bot with @botfather</a>\n\n',
      '<b>How to use botfather ?</b>\n',
      'https://telegram.me/botfather\n'
    ]
  }

  yield telegram.sendMessage(user, text.join(''), 'HTML', true)
}

/**
* disConnect bot
*/
const disconnect = function* (user) {
  const bot = user.bot

  if (bot == null)
    return yield telegram.sendMessage(user, 'You have not any bot to disconnect.', 'HTML', true)

  yield connector.delWebhook(bot.token)
  yield User.removeBot(user.id)
  yield telegram.sendMessage(user, '@' + bot.username + ' has been disconnected.', 'HTML', true)
}

/**
* set new bot token
*/
const token = function* (user, token) {

  let info
  let text

  try {
    info = yield connector.info(token)
    text = '@' + info.result.username + ' has been connected to @savevideobot.'

    yield connector.setWebhook(token)
    yield User.addBot(user.id, token, info.result)
  }
  catch(e) {
    text = [
      '<b>Invalid bot token</b>\n\n',
      'Telegram response: \n',
      e.response.body.description
    ].join('')
  }

  yield telegram.sendMessage(user, text, 'HTML', true)
}
