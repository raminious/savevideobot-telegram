const bytes = require('bytes')
const _ = require('underscore')
const Session = require('../services/session')
const telegram = require('./telegram')
const config = require('../../config.json')

// add moment
const moment = require('moment')
require('moment-duration-format')

// add retry plugin to superagent library
const agent = require('superagent')

const Media = {}

Media.explore = async function (session, url, callback) {
  return await agent
    .post(config.api + '/media/explore')
    .set({'access-token': session.access_token})
    .set({'app-platform': 'telegram'})
    .send({ url, callback })
}

Media.download = async function (session, id, format, webhook, callback) {
  return await agent
    .post(config.api + '/media/download/' + id + '/' + format)
    .set({'access-token': session.access_token})
    .set({'app-platform': 'telegram'})
    .send({ webhook, callback })
}

/*
* display media and it's quality options to client
*/
Media.display = async function (session, media) {
  // resolve media formats to dispaly to user
  const formats = []

  _.each(media.formats, f => {
    let type = f.dimension == '' ? 'Audio' : 'Video'
    let quality = f.dimension != '' && typeof f.dimension != 'undefined' ? f.dimension : f.abr + ' kbit/s'
    let size = bytes(f.size)
    let extension = f.ext.toUpperCase()
    let download = '/' + media.id + f.id

    if (media.formats.length > 7 && (f.ext == 'webm' || f.ext == '3gp')) {
      return false
    }

    const button = {
      text: type + ': ' + quality + ' | ' + extension,
      callback_data: download
    }

    if (size != null) {
      button.text += ' | ' + size
    }

    formats.push([button])
  })

  // create result output
  let result = '<code>Site      :</code> ' + media.site + '\n'
  result    += '<code>Title     :</code> ' + media.title + '\n'

  if (formats.length == 0) {
    result    += '<code>File Type :</code> ' + media.extension + '\n\n'
  }

  if (~~media.duration > 0) {
    media.duration = moment.duration(~~media.duration, 'seconds').format('h:mm:ss', { forceLength: true })
    result    += '<code>Duration  :</code> ' + media.duration + '\n\n'
  }

  if (media.thumbnail != null) {
    result += '<a href="' + media.thumbnail +'">[Video Thumbnail]</a>'
  }

  await telegram.sendMessage(session, result, 'HTML', false, { inline_keyboard: formats })

  /*
  * force download video if not have any format option
  */
  if (formats.length == 0) {
    return await require('../bot-command/download')(session, '/' + media.id + 'best')
  }

  // terminate session
  Session.terminate(session.id)
}

module.exports = Media
