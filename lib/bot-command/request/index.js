'use strict'

const request = require('superagent')
const _ = require('underscore')
const bytes = require('bytes')
const config = require('../../../config.json')
const telegram = require('../../resources/telegram')(config.token)
const Media = require('../../resources/media')

const moment = require('moment')
require('moment-duration-format')

module.exports = function* (user, url) {

  url = url.match(/(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi)

  if (url == null || url.length > 1)
    return false

  // extract url
  url = url[0].trim()

  yield telegram.sendMessage(user.id, 'We received your request it may take a few moments to a minute for processing your request, thanks for your patient \n\n' +
    'Please follow our official channel @SaveVideo on Telegram and also follow us on [Facebook](https://www.facebook.com/savevideobot) and [Twitter](https://twitter.com/SaveVideoBot)\n\n' +
    'Please send your feedbacks to our official Facebook and Twitter pages\n‌‌', 'Markdown', true)

  let response
  try {
    // get video detail
    response = yield Media.info(user, url)
  }
  catch(e) {
    console.log('Error')
    return false
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

    if (f.ext == 'webm')
      return false

    formats.push([{text: type + ': ' + quality + ' | ' + extension + ' | ' + size, callback_data: download}])
  })

  // create result output
  let result = '<code>Title    :</code> ' + media.title + '\n'

  if (~~media.duration > 0)
    result += '<code>Duration :</code> ' + moment.duration(~~media.duration, 'seconds').format('h:mm:ss', { forceLength: true }) + '\n\n'

  result += '<a href="' + media.thumbnail +'">[Video Thumbnail]</a>'

  // send video info to user
  yield telegram.sendMessage(user.id, result, 'HTML', false, { inline_keyboard: formats })

  // force download video if not have any format option
  if (formats.length == 0) {
    yield require('../download')(user, '/' + media._id + 'best', media)
  }

}
