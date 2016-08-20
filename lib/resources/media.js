const request = require('superagent')
const config = require('../../config.json')

const media = {}

media.info = function* (user, url) {
  return yield request
    .post(config.api + 'media/info')
    .set({'access-token': user.access_token})
    .send({ url })
}

media.download = function* (user, id, format, webhook) {
  return yield request
    .post(config.api + 'media/download')
    .set({'access-token': user.access_token})
    .send({ id, format, webhook })
}

module.exports = media
