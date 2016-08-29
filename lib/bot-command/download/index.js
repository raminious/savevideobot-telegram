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

  try {
    const response = yield download(user, id, format, webhook)

    if (response.statusCode === 206)
      return yield telegram.sendMessage(user.id, 'This request is expired or not found\n' +
        'Send another video url to continue')
  }
  catch (e){
    const message = e.code || e.errorno || 'api_error'
    const info = { target: 'api', task: 'media/info', url: url }
    info.description = e.response && e.response.text
    throw { message, info }
  }

  // send notification to user
  yield telegram.sendMessage(user.id, 'The bot started process and downloading your request\n‌‌' +
    '*It may take a few seconds to some minutes depending on your requested file size and our download request queue*\n\n' +
    'Please be patient'
    , 'Markdown')
}
