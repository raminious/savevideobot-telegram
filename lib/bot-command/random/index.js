'use strict'

const request = require('superagent')
const config = require('../../../config.json')
const telegram = require('../../resources/telegram')

module.exports = function* (session, message) {

  const text = [
    'Random video is not available at this time'
  ].join('\n')

  yield telegram.sendMessage(session, text, 'Markdown')
}
