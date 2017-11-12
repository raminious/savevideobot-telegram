const request = require('superagent')
const config = require('../../config.json')

const User = {}

/**
* request server to add new bot
*/
User.addBot = async function(session, token, botInfo) {
  try {
    // save bot-info into db
    await request
      .post(config.api + '/telegram/add-bot')
      .set({'access-token': session.access_token})
      .set({'app-platform': 'telegram'})
      .send({ token, botInfo })

  } catch(e) {
    console.log(e)
    throw e
  }
}

/**
* request server to remove bot
*/
User.removeBot = async function(session) {
  try {
    return await request
      .post(config.api + '/telegram/remove-bot')
      .set({'access-token': session.access_token})
      .set({'app-platform': 'telegram'})
  } catch(e) {
    throw e
  }
}

/**
* integrate(merge) account with telegram account
*/
User.integrate = async function(session, userId) {
  try {
    return await request
      .post(config.api + '/telegram/integrate')
      .set({'access-token': session.access_token})
      .set({'app-platform': 'telegram'})
      .send({ userId })
  } catch(e) {
    throw e
  }
}

User.getIdentity = async function(user) {
  try {
    const response = await request
      .post(config.api + '/user/access-token')
      .set({'authentication-method': 'telegram-id'})
      .set({'app-platform': 'telegram'})
      .send(user)

    return response.body
  } catch(e) {
    return null
  }
}

module.exports = User
