'use strict'

const config = require('../../../config.json')
const telegram = require('../../resources/telegram')(config.token)
const download = require('../../resources/media').download
const File = require('../../database/file')

module.exports = function* (user, hash, media) {

  const id = hash.substr(1, 24)
  const format = hash.substr(25)

  const file = yield File.find({ media_id: id, format })

  // if file id is exists, resend it
  if (file != null)
    return yield telegram.sendFile(user.id, file)

  const webhook = {
    type: 'telegram',
    bot_token: config.token,
    user_id: user.id,
    url: config.base_url + 'webhook/download'
  }

  // send notification to user
  const message_id = yield telegram.sendMessage(user.id, 'The bot started process and downloading your request\n\n' +
    'It may take a few seconds to some minutes depending on:\n' +
    '*1- Your requested file size*\n' +
    '*2- Servers speed of target website*\n' +
    '*3- Our download requests queue*\n\n' +
    'Please be patient'
    , 'Markdown')

  try {
    yield download(user, id, format, webhook)
  }
  catch (e) {

    const status = e.response.statusCode

    if (e.response != null && (status == 406 || status == 413))
      return yield telegram.editMessage(user.id, message_id, e.response.text)

    const message = e.code || e.errorno || 'api_error'
    const info = { target: 'api', task: 'media/download' }
    info.description = e.response && e.response.text
    throw { message, info }
  }
}
