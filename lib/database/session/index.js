'use strict'

const config = require('../../../config.json')

const session = {}

/**
* create new session
*/
session.create = function* (user) {

  // should pipe response through user bot?
  const pipe = user.bot && user.bot.pipe

  // get user registered bot
  const user_bot = user.bot? user.bot: null

  const data = {
  	user: user._id,
    user_bot: user_bot,
    user_id: user.id,
    access_token: user.access_token,
  	bot_token: pipe? user_bot.token: config.token,
  	bot_name: pipe? user_bot.username: config.name
  }

  return data
}

/**
* parse sesssion
*/
session.parse = function* (data) {
	return JSON.parse(data)
}


module.exports = session
