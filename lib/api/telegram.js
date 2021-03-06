const config = require('../../config.json')

// add retry plugin to superagent library
const agent = require('superagent')
require('superagent-retry')(agent)

const Telegram = {}

const url = 'https://api.telegram.org/bot'

/**
* Send message to user on telegram
*/
Telegram.sendMessage = async function(session, text, parse_mode, disable_web_page_preview,
  reply_markup, reply_to_message_id, showFooter = true) {

  parse_mode = parse_mode || ''
  disable_web_page_preview = disable_web_page_preview || false
  reply_markup = JSON.stringify(reply_markup) || {}
  reply_to_message_id = reply_to_message_id || null

  // add footer
  if (showFooter) {
    const footerLink = 'https://t.me/savevideo'

    if (parse_mode === 'HTML') {
      text = text.trim() + `\n\n<a href="${footerLink}">SaveVideoBot</a>`
    } else if (parse_mode === 'Markdown') {
      text = text.trim() + `\n\n[SaveVideoBot](${footerLink})`
    } else {
      text = text.trim() + '\n\nsave video bot'
    }
  }

  try {
    const response = await agent
      .get(url + session.bot_token + '/sendMessage')
      .retry(1)
      .query({
        chat_id: session.chat_id,
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
Telegram.editMessage = async function(session, message_id, text, parse_mode, disable_web_page_preview,
  reply_markup, reply_to_message_id) {

  parse_mode = parse_mode || ''
  disable_web_page_preview = disable_web_page_preview || false
  reply_to_message_id = reply_to_message_id || null
  reply_markup = JSON.stringify(reply_markup) || {}

  // add footer
  text = text.trim() + '\n\nsave video bot'

  try {
    return await agent
      .get(url + session.bot_token + '/editMessageText')
      .retry(1)
      .query({
        chat_id: session.chat_id,
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
Telegram.sendFile = async function(session, file) {

  const methods = {
    document: '/sendDocument',
    video: '/sendVideo',
    audio: '/sendAudio'
  }

  try {
    return await agent
      .post(url + session.bot_token + methods[file.type])
      .retry(1)
      .send({
        chat_id: session.chat_id,
        [file.type]: file.file_id,
        caption: 'SaveVideoBot.com'
      })
  }
  catch(e) { /* nothing */ }
}

/**
* Send message to user on telegram
*/
Telegram.sendSticker = function(session, sticker, silent) {

  try {
    agent
      .post(url + session.bot_token + '/sendSticker')
      .send({ chat_id: session.chat_id })
      .send({ sticker })
      .send({ disable_notification: silent })
      .end((err, res) => {})
  }
  catch(e) { /* nothing */ }
}

/*
* send photo to user (only when photo id is exists)
*/
Telegram.sendPhoto = async function(session, photo, caption) {
  try {
    return await agent
      .post(url + session.bot_token + '/sendPhoto')
      .send({ chat_id: session.chat_id })
      .send({ photo })
      .send({ caption })
  }
  catch(e) { /* nothing */ }
}

/**
* explore information of bot based on token
*/
Telegram.getBotInfo = async function(token) {
  const response = await agent
    .get('https://api.telegram.org/bot' + token + '/getMe')

  return response.body
}

/**
* set webhook for bot
*/
Telegram.setWebhook = async function(id, token) {
  const url = 'https://savevideobot.com/telegram/dispatch/' + id

  return await agent
    .get('https://api.telegram.org/bot' + token + '/setWebhook?url=' + url)
}

/*
* revoke webhook of bot
*/
Telegram.delWebhook = async function(token) {
  return await agent
    .get('https://api.telegram.org/bot' + token + '/setWebhook')
}

module.exports = Telegram
