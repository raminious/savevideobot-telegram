'use strict'

const request = require('superagent')
const config = require('../../config.json')

const connect = {}

/**
* explore information of bot based on token
*/
connect.info = function* (token) {
  const response = yield request
    .get('https://api.telegram.org/bot' + token + '/getMe')

  return response.body
}

/**
* set webhook for bot
*/
connect.setWebhook = function* (id, token) {

  const url = 'https://savevideobot.com/telegram/dispatch/' + id
  return yield request.get('https://api.telegram.org/bot' + token + '/setWebhook?url=' + url)
}

/*
* revoke webhook of bot
*/
connect.delWebhook = function* (token) {
  return yield request.get('https://api.telegram.org/bot' + token + '/setWebhook')
}

module.exports = connect
