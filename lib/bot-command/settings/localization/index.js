'use strict'

const request = require('superagent')
const config = require('../../../../config.json')
const updateProfile = require('../../../resources/user').updateProfile
const telegram = require('../../../resources/telegram')
const User = require('../../../database/user')

module.exports = function* (session, message) {

  const list = [ 'fa', 'ru', 'en', 'ar', 'es', 'it']
  const localization = message.split('_')[1]

  yield updateProfile(session.access_token, { localization: list[localization] })
  yield User.update(session.user_id , { localization: list[localization] })

  yield telegram.sendMessage(session,
    'Thank you, your localization has been saved. Now you can resend your last request.',
    'HTML')
}
