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

    // add footer
    text = text.trim() + '\n\nꜱᴀᴠᴇ ᴠɪᴅᴇᴏ ʙᴏᴛ'

    try {
      const response = yield agent
        .get(baseUrl + '/sendMessage')
        .query({
          chat_id,
          text,
          parse_mode,
          disable_web_page_preview,
          reply_markup,
          reply_to_message_id
        })

      return response.body.result.message_id
    }
    catch(e) {
      console.log(e)
    }
  }

  /**
  * Update message text
  */
  module.editMessage = function* (chat_id, message_id, text, parse_mode, disable_web_page_preview,
    reply_markup, reply_to_message_id) {

    parse_mode = parse_mode || ''
    disable_web_page_preview = disable_web_page_preview || false
    reply_to_message_id = reply_to_message_id || null
    reply_markup = JSON.stringify(reply_markup) || {}

    // add footer
    text = text.trim() + '\n\nꜱᴀᴠᴇ ᴠɪᴅᴇᴏ ʙᴏᴛ'

    try {
      return yield agent
        .get(baseUrl + '/editMessageText')
        .query({
          chat_id,
          message_id,
          text,
          parse_mode,
          disable_web_page_preview,
          reply_markup
        })
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
