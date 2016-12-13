'use strict'

const moment = require('moment')
const config = require('../../../config.json')
const db = require('../mongo')
const cache = require('../cache')
const Schema = db.Schema
const getAccessToken = require('../../resources/user').accessToken
const telegram = require('../../resources/telegram')

const cachePrefix = 'user_tid_'

const schema = new Schema({
  id: String,
  bot: Object,
  access_token: String,
  localization: String
}, {
  timestamps: { created_at: 'created_at', updated_at: 'updated_at' }
})

const User = db.model('User', schema)

module.exports = {
  removeCache: function(userId) {
    cache.remove(cachePrefix + userId)
  },
  getIdentity: function* (identity){
    // get user identity
    let user = yield this.findById(identity.id)

    //auto signup user if not registered
    if (user == null) {

      // request token for new user
      const response = yield getAccessToken(identity)

      // store user token and id
      user = yield this.create({
        id: identity.id,
        access_token: response.body.token,
        localization: response.body.localization,
        time: identity.time || moment().format()
      })
    }

    return user
  },
  findById: function* (userId){
    let user = yield cache.find(cachePrefix + userId)

    if (user == null) {
      user = yield User.findOne({ id: userId.toString() })
      if (user) cache.save(cachePrefix + user.id, user, 3600).then(r => r, e => e)
    }

    return user
  },
  create: function* (identity) {
    const u = new User({
      id: identity.id,
      access_token: identity.access_token,
      localization: identity.localization,
      createdAt: identity.time
    })
    return yield u.save()
  },
  update: function* (userId, attrs) {
    this.removeCache(userId)
    return yield User.findOneAndUpdate({id: userId}, attrs)
  },
  addBot: function* (userId, token, info) {
    return yield this.update(userId, {
      bot: {
        token,
        name: info.first_name,
        username: info.username.toLowerCase()
      }
    })
  },
  removeBot: function* (userId) {
    return yield this.update(userId, { bot: null })
  },
  // requestPhoneNumber: function* (session) {
  //   const keyboard = [
  //     [{ text: 'Verify My Account', request_contact: true }]
  //   ]

  //   yield telegram.sendMessage(session,
  //     '<b>You must verify your account to continue using savevideobot services</b>',
  //     'HTML', false, { keyboard, one_time_keyboard: true, resize_keyboard: true })
  // },
  requestLanguage: function* (session) {
    const languages = []
    const list = [ 'فارسی', 'русский', 'العربية', 'Español', 'English', 'Italiano']

    list.forEach((text, key) =>
      languages.push([ { text, callback_data: 'setlocal:' + key + '-session:' + session.id } ])
    )

    yield telegram.sendMessage(session,
      'Please select your language to continue.',
      'HTML', false, { inline_keyboard: languages })
  }
}
