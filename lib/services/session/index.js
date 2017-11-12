const cache = require('../cache')
const config = require('../../../config.json')

// prefix name for sessions
const prefix = 'svb__telegram_session_'

const Session = {}

/**
* create new session
*/
Session.store = async function(id, user, message, ttl) {
  // should pipe response through user bot?
  const pipe = user.telegram_bot &&
    user.telegram_bot.token &&
    user.telegram_bot.pipe === true

  // get user registered bot
  const user_bot = pipe && user.telegram_bot

  const data = {
    id,
  	user: user.id,
    user_bot: user.telegram_bot,
    telegram_bot: user.telegram_bot,
    user_id: user.telegram_id,
    chat_id: user.chat_id,
    access_token: user.access_token,
  	bot_token: pipe ? user_bot.token : config.token,
  	bot_name: pipe ? user_bot.username : config.name,
		message: message
  }

  if (~~ttl > 0) {
    await cache.save(prefix + id, data, ttl)
  }

  return data
}

/**
* find session by id
*/
Session.find = async function(id) {
	return await cache.find(prefix + id)
}

/**
* find session by its id and then remove it
*/
Session.findAndTerminate = async function(id) {
	const find = await Session.find(id)
	Session.terminate(id)
	return find
}

/**
* terminate session
*/
Session.terminate = function(id) {
	cache.remove(prefix+id)
}

module.exports = Session
