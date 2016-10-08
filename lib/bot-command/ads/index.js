'use strict'

const request = require('superagent')
const config = require('../../../config.json')
const telegram = require('../../resources/telegram')

module.exports = function* (session, message) {

  const text = [
    'To order an advertisement, send a direct message to @svb_ads'
  ].join('\n')

  yield telegram.sendMessage(session, text)
}
