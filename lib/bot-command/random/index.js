'use strict'

const request = require('superagent')
const config = require('../../../config.json')
const telegram = require('../../resources/telegram')

module.exports = function* (user, message) {

  const text = [
    'Random video is not available at this time'
  ].join('\n')

  yield telegram.sendMessage(user, text, 'Markdown')
}
