'use strict'

const _ = require('underscore')
const telegram = require('../../resources/telegram')
const Media = require('../../resources/media')
const Session = require('../../database/session')
const log = require('../../../log')
const config = require('../../../config.json')

const MEDIA_READY = 'ready'

module.exports = function* (session, url) {

  const callback = {
    id: session.id,
    type: 'url',
    url: config.base_url + 'callback/explore',
  }
  
  // Media instance of url
  let media

  try {
    media = yield Media.explore(session, url, callback)
    media = media.body
  }
  catch(e) {

    // terminate session on error
    Session.terminate(session.id)

    // if api server is down
    if (e.response == null) {
      log('fatal', 'api_down', { 
        target: 'api', 
        task: 'media/explore', 
        url
      })
    }

    return yield telegram.sendMessage(session, 
      'The bot is too busy and not responding to your request now\n', 'HTML', true, 
      { inline_keyboard: [[{ text: 'Try again', callback_data: '/retry' + session.id }]] })
  }

  // if media processed before
  if (media.status == MEDIA_READY)
    return yield Media.display(session, media)

  // if media is requested for first time
  return yield telegram.sendMessage(session, 'Your request has been received.\n' + 
    'It may take a few seconds to a minute to process your request.\n\n' +
    'Please follow our official channel @SaveVideo on Telegram and also follow us on ' +
    '[Facebook](https://www.facebook.com/savevideobot) and [Twitter](https://twitter.com/SaveVideoBot)\n\n'
      ,'Markdown', true)
}
