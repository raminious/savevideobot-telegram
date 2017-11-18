const Telegram = require('../../api/telegram')
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

  if (bot && bot.token) {
    text = [
      'You have already connected @' + bot.username + '\n',
      'To connect new bot, first you must send /disconnect to unlink ',
      '<b>' + bot.username + '</b>'
    ]
  } else {
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

  await Telegram.sendMessage(session, text.join(''), 'HTML', true)
}

/**
* disConnect bot
*/
const disconnect = async function(session) {
  const bot = session.user_bot
  let text

  if (!bot.token) {
    text = 'You have not any bot to disconnect.'
  } else {
    try {
      // delete webhook
      await Telegram.delWebhook(bot.token)

      // remove bot
      await User.removeBot(session)

      text = `@${bot.username} has been disconnected.`
    } catch(e) {
      text = `Could not disconnect @${bot.username}. Try again.`
    }
  }

  await Telegram.sendMessage(session, text, 'HTML', true)
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

    return await Telegram.sendMessage(session, text.join(''), 'HTML', true)
  }

  try {
    info = await Telegram.getBotInfo(token)
    text = '@' + info.result.username + ' has been connected to @savevideobot'

    // set telegram webhook
    await Telegram.setWebhook(session.user, token)

    // set webhook + add bot to database
    await User.addBot(session, token, info.result)
  }
  catch(e) {
    text = [
      '<b>Invalid bot token</b>\n\n',
      'Telegram response: \n',
      e.response.body.description
    ].join('')
  }

  await Telegram.sendMessage(session, text, 'HTML', true)
}
