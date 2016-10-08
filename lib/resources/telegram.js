'use strict'

const config = require('../../config.json')

// add retry plugin to superagent library
const agent = require('superagent')
require('superagent-retry')(agent)

const telegram = {}

const url = 'https://api.telegram.org/bot'

/**
* Send message to user on telegram
*/
telegram.sendMessage = function* (session, text, parse_mode, disable_web_page_preview,
  reply_markup, reply_to_message_id) {

  parse_mode = parse_mode || ''
  disable_web_page_preview = disable_web_page_preview || false
  reply_to_message_id = reply_to_message_id || null
  reply_markup = JSON.stringify(reply_markup) || {}

  // add footer
  text = text.trim() + '\n\nsᴀᴠᴇ ᴠɪᴅᴇᴏ ʙᴏᴛ'

  try {
    const response = yield agent
      .get(url + session.bot_token + '/sendMessage')
      .retry(1)
      .query({
        chat_id: session.user_id,
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

/**
* edit message before sent to client
*/
telegram.editMessage = function* (session, message_id, text, parse_mode, disable_web_page_preview,
  reply_markup, reply_to_message_id) {

  parse_mode = parse_mode || ''
  disable_web_page_preview = disable_web_page_preview || false
  reply_to_message_id = reply_to_message_id || null
  reply_markup = JSON.stringify(reply_markup) || {}

  // add footer
  text = text.trim() + '\n\nsᴀᴠᴇ ᴠɪᴅᴇᴏ ʙᴏᴛ'

  try {
    return yield agent
      .get(url + session.bot_token + '/editMessageText')
      .retry(1)
      .query({
        chat_id: session.user_id,
        message_id,
        text,
        parse_mode,
        disable_web_page_preview,
        reply_markup
      })
  }
  catch(e){
    throw e
  }
}

/*
* send file to user (only when file id is exists)
*/
telegram.sendFile = function* (session, file) {

  const methods = {
    document: '/sendDocument',
    video: '/sendVideo',
    audio: '/sendAudio'
  }

  try {
    return yield agent
      .post(url + session.bot_token + methods[file.type])
      .retry(1)
      .send({
        chat_id: session.user_id,
        [file.type]: file.file_id,
        caption: 'SaveVideoBot.com'
      })
  }
  catch(e) {
    throw e
  }
}

/**
* Send message to user on telegram
*/
telegram.sendSticker = function (session, sticker, silent) {

  try {
    agent
      .post(url + session.bot_token + '/sendSticker')
      .send({ chat_id: session.user_id })
      .send({ sticker })
      .send({ disable_notification: silent })
      .end((err, res) => {})
  }
  catch(e) {
    throw e
  }
}

module.exports = telegram
