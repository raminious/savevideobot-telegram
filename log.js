'use strict'

const agent = require('superagent')
const config = require('./config.json')

module.exports = function (level, message, info) {

  agent
    .post(config.log.url)
    .auth(config.log.auth.username, config.log.auth.password, { type: 'auto' })
    .send({
      level,
      short_message: message,
      from: 'telegram'
    })
    .send(info)
    .end((err, res) => {})
}

