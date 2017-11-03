const request = require('superagent')
const config = require('../../config.json')

const User = {}

User.getIdentity = async function(user) {
  try {
    const response = await request
      .post(config.api + '/user/access-token')
      .set({'authentication-method': 'telegram-id'})
      .send(user)

    return response.body
  } catch(e) {
    return null
  }
}

User.updateProfile = async function(token, attributes) {
  return await request
    .post(config.api + '/user/profile')
    .set('access-token', token)
    .send(attributes)
}

module.exports = User
