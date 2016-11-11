'use strict'

const telegram = require('../../resources/telegram')
const advertisement = require('../../resources/advertisement')
const download = require('../../resources/media').download
const File = require('../../database/file')
const Session = require('../../database/session')
const log = require('../../../log')
const config = require('../../../config.json')

module.exports = function* (session, hash) {

  const media_id = hash.substr(1, 24)
  const format = hash.substr(25)

  const file = yield File.find({
    media_id,
    format,
    bot: session.bot_name
  })

  // if file id is exists, resend it
  if (file != null) {
    Session.terminate(session.id)
    return yield telegram.sendFile(session, file)
  }

  const webhook = {
    type: 'telegram',
    bot_token: session.bot_token,
    user_id: session.user_id
  }

  const callback = {
    id: session.id,
    type: 'url',
    url: config.base_url + 'callback/download'
  }

  // send notification to user
  const message_id = yield telegram.sendMessage(session, 'The bot has been started process and downloading your request\n\n' +
    'It may take a few seconds to some minutes depending on:\n' +
    '*1- Your requested file size*\n' +
    '*2- Speed of target website servers*\n' +
    '*3- Our download requests queue*\n\n' +
    'Please be patient'
    , 'Markdown')

  try {
    yield download(session, media_id, format, webhook, callback)

    // display advertisement
    //advertisement.display(session)
  }
  catch (e) {

    if (e.response != null && (e.response.statusCode == 406 || e.response.statusCode == 413))
      return yield telegram.editMessage(session, message_id, e.response.text, 'HTML')

    // if api server is down
    if (e.response == null) {

      log('fatal', 'api_down', {
        target: 'api',
        task: 'media/download'
      })

      return yield telegram.editMessage(session, message_id,
        'The bot is too busy and not responding to your download request now\n', 'HTML', true,
        { inline_keyboard: [[{ text: 'Try again', callback_data: '/retry' + session.id }]] })
    }
  }
}
