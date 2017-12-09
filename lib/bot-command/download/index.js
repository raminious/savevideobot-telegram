const telegram = require('../../api/telegram')
const download = require('../../api/media').download
const File = require('../../services/file')
const Session = require('../../services/session')
const log = require('../../../log')
const config = require('../../../config.json')

module.exports = async function (session, hash) {

  const media_id = hash.substr(1, 24)
  const format = hash.substr(25)

  const file = await File.find(media_id, format, session.bot_name)

  // if file id is exists, resend it
  if (file != null) {
    Session.terminate(session.id)
    return await telegram.sendFile(session, file)
  }

  const webhook = {
    type: 'telegram',
    bot_token: session.bot_token,
    user_id: session.chat_id
  }

  const callback = {
    id: session.id,
    type: 'url',
    url: config.base_url + 'callback/download'
  }

  // send notification to user
  const message_id = await telegram.sendMessage(session, 'The bot has been started process and downloading your request\n\n' +
    'It may take a few seconds to some minutes depending on:\n' +
    '*1- Your requested file size*\n' +
    '*2- Speed of target website servers*\n' +
    '*3- Our download requests queue*\n\n' +
    'Please be patient'
    , 'Markdown', true)

  try {
    // request for download video
    await download(session, media_id, format, webhook, callback)
  }
  catch (e) {

    if (e.response != null &&
      (e.response.statusCode == 406 || e.response.statusCode == 413))
    {
      return await telegram.editMessage(session, message_id, e.response.text, 'HTML')
    }

    // if api server is down
    if (e.response == null) {
      log('fatal', 'api_down', {
        target: 'api',
        task: 'media/download'
      })

      return await telegram.editMessage(session, message_id,
        'The bot is too busy and not responding to your download request now\n', 'HTML', true,
        { inline_keyboard: [[{ text: 'Try again', callback_data: '/retry' + session.id }]] })
    }
  }
}
