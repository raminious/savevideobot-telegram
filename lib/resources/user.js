const request = require('superagent')
const config = require('../../config.json')

const user = {}

user.accessToken = function* (identity) {
  return yield request
    .post(config.api + 'user/access-token')
    .send({method: 'telegram'})
    .send(identity)
}

module.exports = user
