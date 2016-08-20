'use strict'

const config = require('../../../config.json')
const db = require('../mongo')
const Schema = db.Schema
const getAcessToken = require('../../resources/user').accessToken

const schema = new Schema({
  id: String,
  access_token: String
}, {
  timestamps: { created_at: 'created_at' }
})

const User = db.model('User', schema)

module.exports = {

  getIdentity: function* (identity){

    // get user identity
    let user = yield this.findById(identity.id)

    //auto signup user if not registered
    if (user == null) {

      // request token for new user
      const response = yield getAcessToken(identity)

      // store user token and id
      user = yield this.create({
        id: identity.id,
        access_token: response.body.token
      })
    }

    return user
  },
  findById: function* (userId){
    return yield User.findOne({id: userId.toString()})
  },
  create: function* (identity) {
    const u = new User({
      id: identity.id,
      access_token: identity.access_token,
    })
    return yield u.save()
  },
  update: function* (userId, attrs){
    return yield User.findOneAndUpdate({id: userId}, attrs)
  }
}
