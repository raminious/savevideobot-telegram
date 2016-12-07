'use strict'

const redis = require('../redis')
const cache = require('../cache')
const config = require('../../../config.json')

// prefix name for sessions
const prefix = 'telegram_session_'

const session = {}

/**
* create new session
*/
session.store = function* (id, user, message, ttl) {

  // should pipe response through user bot?
  const pipe = user.bot && user.bot.pipe

  // get user registered bot
  const user_bot = user.bot? user.bot: null

  const data = {
    id,
  	user: user._id,
    user_bot: user_bot,
    user_id: user.id,
    chat_id: user.chat_id,
    access_token: user.access_token,
  	bot_token: pipe? user_bot.token: config.token,
  	bot_name: pipe? user_bot.username: config.name,
		message: message
  }

  if (~~ttl > 0) {
    yield cache.save(prefix + id, data, ttl)
  }

  return data
}

/**
* find session by id
*/
session.find = function* (id) {
	return yield cache.find(prefix + id)
}

/**
* find session by its id and then remove it
*/
session.findAndTerminate = function* (id) {
	const find = yield session.find(id)
	session.terminate(id)
	return find
}

/**
* terminate session
*/
session.terminate = function (id) {
	cache.remove(prefix+id)
}

module.exports = session
