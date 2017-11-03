const request = require('superagent')
const config = require('../../config.json')

const Connect = {}

/**
* explore information of bot based on token
*/
Connect.info = async function (token) {
  const response = await request
    .get('https://api.telegram.org/bot' + token + '/getMe')

  return response.body
}

/**
* set webhook for bot
*/
Connect.setWebhook = async function (id, token) {
  const url = 'https://savevideobot.com/telegram/dispatch/' + id
  return await request.get('https://api.telegram.org/bot' + token + '/setWebhook?url=' + url)
}

/*
* revoke webhook of bot
*/
Connect.delWebhook = async function (token) {
  return await request.get('https://api.telegram.org/bot' + token + '/setWebhook')
}

module.exports = Connect
