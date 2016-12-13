'use strict'

const request = require('superagent')
const config = require('../../../../config.json')
const updateProfile = require('../../../resources/user').updateProfile
const telegram = require('../../../resources/telegram')
const User = require('../../../database/user')
const Session = require('../../../database/session')
const explore = require('../../../bot-command/explore')

module.exports = function* (session, message) {

  const list = [ 'fa', 'ru', 'ar', 'es', 'en', 'it']
  const localization = message.match(/[0-5]{1}/)[0]

  if (localization == null)
    return false

  // update language
  yield updateProfile(session.access_token, { localization: list[localization] })
  yield User.update(session.user_id , { localization: list[localization] })

  // send notification
  yield telegram.sendMessage(session, 'Thank you, your localization has been saved.', 'HTML')

  // get last request
  const session_id = message.match(/[0-9]{3,}/)[0]
  session = yield Session.findAndTerminate(session_id)

  if (session == null)
    return false

  // continue with last request
  yield explore(session, session.message)
}
