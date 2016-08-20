'use strict'

const agent = require('superagent')

module.exports = function (token) {

  const module = {}

  const baseUrl = 'https://api.telegram.org/bot' + token

  /**
  * Send message to user on telegram
  */
  module.sendMessage = function* (chat_id, text, parse_mode, disable_web_page_preview,
    reply_markup, reply_to_message_id) {

    parse_mode = parse_mode || ''
    disable_web_page_preview = disable_web_page_preview || false
    reply_to_message_id = reply_to_message_id || null
    reply_markup = JSON.stringify(reply_markup) || {}

    try {
      return yield agent
        .get(baseUrl + '/sendMessage')
        .query({chat_id: chat_id})
        .query({text: text})
        .query({parse_mode: parse_mode})
        .query({disable_web_page_preview: disable_web_page_preview})
        .query({reply_markup: reply_markup})
        .query({reply_to_message_id: reply_to_message_id})
    }
    catch(e) {
      console.log(e)
    }
  }

  /*
  * send file to user (only when file id is exists)
  */
  module.sendFile = function* (chat_id, file) {

    const methods = {
      document: '/sendDocument',
      video: '/sendVideo',
      audio: '/sendAudio'
    }

    try {
      return yield agent
        .post(baseUrl + methods[file.type])
        .send({
          chat_id,
          [file.type]: file.file_id,
          caption: 'SaveVideoBot.com'
        })
    }
    catch(e) {
      throw e
    }
  }

  return module
}
