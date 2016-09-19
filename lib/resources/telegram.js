'use strict'

const agent = require('superagent')
const config = require('../../config.json')
const url = 'https://api.telegram.org/bot'

const telegram = {}

/**
* Send message to user on telegram
*/
telegram.sendMessage = function* (user, text, parse_mode, disable_web_page_preview,
  reply_markup, reply_to_message_id) {

  // set user chat_id
  const chat_id = user.id

  // set bot token
  const token = user.botToken || config.token

  parse_mode = parse_mode || ''
  disable_web_page_preview = disable_web_page_preview || false
  reply_to_message_id = reply_to_message_id || null
  reply_markup = JSON.stringify(reply_markup) || {}

  // add footer
  text = text.trim() + '\n\nꜱᴀᴠᴇ ᴠɪᴅᴇᴏ ʙᴏᴛ'

  try {
    const response = yield agent
      .get(url + token + '/sendMessage')
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
    throw e
  }
}

telegram.editMessage = function* (user, message_id, text, parse_mode, disable_web_page_preview,
  reply_markup, reply_to_message_id) {

  // set user chat_id
  const chat_id = user.id

  // set bot token
  const token = user.botToken || config.token

  parse_mode = parse_mode || ''
  disable_web_page_preview = disable_web_page_preview || false
  reply_to_message_id = reply_to_message_id || null
  reply_markup = JSON.stringify(reply_markup) || {}

  // add footer
  text = text.trim() + '\n\nꜱᴀᴠᴇ ᴠɪᴅᴇᴏ ʙᴏᴛ'

  try {
    return yield agent
      .get(url + token + '/editMessageText')
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
    throw e
  }
}

/*
* send file to user (only when file id is exists)
*/
telegram.sendFile = function* (user, file) {

  // set user chat_id
  const chat_id = user.id

  // set bot token
  const token = user.botToken || config.token

  const methods = {
    document: '/sendDocument',
    video: '/sendVideo',
    audio: '/sendAudio'
  }

  try {
    return yield agent
      .post(url + token + methods[file.type])
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

module.exports = telegram
