'use strict'

const request = require('superagent')
const config = require('../../../config.json')
const telegram = require('../../resources/telegram')
const log = require('../../../log')

module.exports = function* (session, message) {

	// log advertisement requests
	log('info', 'advertisement', { user: session.user_id })

  const text = [
    'To order an advertisement, send a direct message to @svb_ads'
  ].join('\n')

  yield telegram.sendMessage(session, text)
}
