const request = require('superagent')
const config = require('../../config.json')

const user = {}

user.accessToken = function* (identity) {
  return yield request
    .post(config.api + 'user/access-token')
    .send({ method: 'telegram' })
    .send(identity)
}

user.updateProfile = function* (token, attributes) {
  return yield request
    .post(config.api + 'user/profile')
    .set('access-token', token)
    .send(attributes)
}

module.exports = user
