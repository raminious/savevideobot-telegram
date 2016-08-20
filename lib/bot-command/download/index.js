'use strict'

const config = require('../../../config.json')
const telegram = require('../../resources/telegram')(config.token)
const download = require('../../resources/media').download
const File = require('../../database/file')

module.exports = function* (user, hash, media) {

  const id = hash.substr(1, 24)
  const format = hash.substr(25)

  yield telegram.sendMessage(user.id, 'The bot started downloading your request\n‌‌' +
    'It may take a few seconds to some minutes depending on your requested file size and our download request queue\n' +
    'Please be patient\n\n'
    , 'Markdown')

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
    yield download(user, id, format, webhook)
  }
  catch(e){
    console.log(e.response.text, e.response.status)
  }
}
