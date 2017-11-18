const request = require('superagent')
const config = require('../../../config.json')
const Telegram = require('../../api/telegram')
const User = require('../../api/user')

module.exports = async function (session, message) {
  const userId = message.match(/[a-zA-Z0-9]{24}/)[0]
  let text

  try {
    const response = await User.integrate(session, userId)
    text = `Your account integrated with Telegram 👍\nBack to the app.`
  } catch(e) {
    text = `Couldn't integrate. Try again.`
  }

  return await Telegram.sendMessage(session, text, 'HTML', true)
}
