'use strict'

const request = require('superagent')
const config = require('../../../config.json')
const telegram = require('../../resources/telegram')

module.exports = function* (session, message) {

  const text = [
    'Type @vid funny clip and select a media to be downloaded.'
  ].join('\n')

  yield telegram.sendMessage(session, text, 'Markdown')
}
