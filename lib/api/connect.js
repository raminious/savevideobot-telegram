const agent = require('superagent')
const config = require('../../config.json')

const Connect = {}

/**
* request server to add new bot
*/
Connect.addBot = async function(session, token, botInfo) {
  try {
    // set telegram webhook
    await Connect.setWebhook(session.user, token)

    // save bot-info into db
    await agent
      .post(config.api + '/telegram/add-bot')
      .set({'access-token': session.access_token})
      .send({ token, botInfo })

  } catch(e) {
    console.log(e)
    throw e
  }
}

/**
* request server to remove bot
*/
Connect.removeBot = async function(session, bot) {
  try {
    await Connect.delWebhook(bot.token)

    return await agent
      .post(config.api + '/telegram/remove-bot')
      .set({'access-token': session.access_token})
  } catch(e) {
    throw e
  }
}

/**
* explore information of bot based on token
*/
Connect.info = async function(token) {
  const response = await agent
    .get('https://api.telegram.org/bot' + token + '/getMe')

  return response.body
}

/**
* set webhook for bot
*/
Connect.setWebhook = async function(id, token) {
  const url = 'https://savevideobot.com/telegram/dispatch/' + id
  return await agent
    .get('https://api.telegram.org/bot' + token + '/setWebhook?url=' + url)
}

/*
* revoke webhook of bot
*/
Connect.delWebhook = async function(token) {
  return await agent
    .get('https://api.telegram.org/bot' + token + '/setWebhook')
}

module.exports = Connect
