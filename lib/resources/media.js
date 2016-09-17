const request = require('superagent')
const config = require('../../config.json')

const media = {}

media.explore = function* (user, url) {
  return yield request
    .post(config.api + 'media/explore')
    .set({'access-token': user.access_token})
    .send({ url })
}

media.download = function* (user, id, format, webhook) {
  return yield request
    .post(config.api + 'media/download/' + id + '/' + format)
    .set({'access-token': user.access_token})
    .send({ webhook })
}

module.exports = media
