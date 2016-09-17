'use strict'

const request = require('superagent')
const _ = require('underscore')
const bytes = require('bytes')
const moment = require('moment')
const config = require('../../../config.json')
const telegram = require('../../resources/telegram')(config.token)
const Media = require('../../resources/media')

module.exports = function* (user, url) {

  yield telegram.sendMessage(user.id, 'We received your request it may take a few moments to a minute for processing your request, thanks for your patient \n\n' +
    'Please follow our official channel @SaveVideo on Telegram and also follow us on [Facebook](https://www.facebook.com/savevideobot) and [Twitter](https://twitter.com/SaveVideoBot)\n\n' +
    'Please send your feedbacks to our official Facebook and Twitter pages\n‌‌', 'Markdown', true)

  let response
  try {
    // get video detail
    response = yield Media.explore(user, url)
  }
  catch (e) {

    if (e.response != null && e.response.statusCode == 406)
      return yield telegram.sendMessage(user.id, e.response.text)

    const message = e.code || e.errorno || 'api_error'
    const info = { target: 'api', task: 'media/explore', url }
    info.description = e.response && e.response.text
    throw { message, info }
  }

  const media = response.body

  // resolve media formats to dispaly to user
  const formats = []

  _.each(media.formats, f => {

    let type = f.dimension == '' ? 'Audio' : 'Video'
    let quality = f.dimension != '' && typeof f.dimension != 'undefined' ? f.dimension : f.abr + ' kbit/s'
    let size = bytes(f.size)
    let extension = f.ext.toUpperCase()
    let download = '/' + media._id + f.id

    if (media.formats.length > 7 && (f.ext == 'webm' || f.ext == '3gp'))
      return false

    const button = {
      text: type + ': ' + quality + ' | ' + extension,
      callback_data: download
    }

    if (size != null)
      button.text += ' | ' + size

    formats.push([button])
  })

  // create result output
  let result = '<code>Site      :</code> ' + media.site + '\n'
  result    += '<code>Title     :</code> ' + media.title + '\n'

  if (formats.length == 0)
  result    += '<code>File Type :</code> ' + media.extension + '\n\n'

  if (~~media.duration > 0)
    result += '<code>Duration :</code> ' + media.duration + '\n\n'

  if (media.thumbnail != null)
    result += '<a href="' + media.thumbnail +'">[Video Thumbnail]</a>'

  // send video info to user
  yield telegram.sendMessage(user.id, result, 'HTML', false, { inline_keyboard: formats })

  // force download video if not have any format option
  if (formats.length == 0)
    yield require('../download')(user, '/' + media.id + 'best', media)
}
