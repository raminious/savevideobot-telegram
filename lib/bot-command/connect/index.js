const telegram = require('../../api/telegram')
const connector = require('../../api/connect')
const User = require('../../api/user')

module.exports = async function(session, message) {
  const commands = {
    '/connect'    : connect,
    '/disconnect' : disconnect
  }

  // get bot command { connect, disconnect, token }
  const command = commands[message] || token

  // run command
  await command(session, message)
}

/**
* Connect new bot to savevideobot
*/
const connect = async function(session) {

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

  await telegram.sendMessage(session, text.join(''), 'HTML', true)
}

/**
* disConnect bot
*/
const disconnect = async function(session) {

  const bot = session.user_bot

  if (!bot) {
    return await telegram.sendMessage(session, 'You have not any bot to disconnect.', 'HTML', true)
  }

  await connector.delWebhook(bot.token)
  await User.removeBot(session.user_id)
  await telegram.sendMessage(session, '@' + bot.username + ' has been disconnected.', 'HTML', true)
}

/**
* set new bot token
*/
const token = async function(session, token) {
  let info
  let text

  const bot = session.user_bot

  if (bot) {

    text = [
      'You have already connected @' + bot.username + '\n',
      'To connect new bot, first you must send /disconnect to unlink ',
      '<b>' + bot.username + '</b>'
    ]

    return await telegram.sendMessage(session, text.join(''), 'HTML', true)
  }

  try {
    info = await connector.info(token)
    text = '@' + info.result.username + ' has been connected to @savevideobot'

    await connector.setWebhook(session.user, token)
    await User.addBot(session.user_id, token, info.result)
  }
  catch(e) {
    text = [
      '<b>Invalid bot token</b>\n\n',
      'Telegram response: \n',
      e.response.body.description
    ].join('')
  }

  await telegram.sendMessage(session, text, 'HTML', true)
}
