'use strict'

const redis = require('../redis')
const config = require('../../../config.json')

// prefix name for sessions
const prefix = 'telegram_session_'

const session = {}

/**
* create new session
*/
session.store = function* (id, user, message, ttl) {

	const key = prefix + id
  const expire = ttl || 0

  // should pipe response through user bot?
  const pipe = user.bot && user.bot.pipe

  // get user registered bot
  const user_bot = user.bot? user.bot: null

  const data = {
    id,
  	user: user._id,
    user_bot: user_bot,
    user_id: user.id,
    access_token: user.access_token,
  	bot_token: pipe? user_bot.token: config.token,
  	bot_name: pipe? user_bot.username: config.name,
		message: message
  }

  if (ttl > 0) {
    yield redis.setAsync(key, JSON.stringify(data))
    redis.expire(key, expire)
  }
  
  return data
}

/**
* find session by id
*/
session.find = function* (id) {
	const data = yield client.getAsync(prefix + id)
	return JSON.parse(data)
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
	client.del(prefix+id)
}

module.exports = session
