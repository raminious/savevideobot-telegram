const request = require('superagent')
const config = require('../../../config.json')
const telegram = require('../../api/telegram')

module.exports = async function (session, message) {

  const text = [
    'Welcome to <b>SaveVideoBot</b>\n',
    '<b>How SaveVideoBot can help me ?</b>',
    '@SaveVideoBot is the biggest video and audio downloader bot on Telegram messenger.\n',
    '<b>I want to download a video and keep it offline</b>',
    'Okay, Send video link from any video sharing websites (like Youtube, Vimeo, Instagram, 9gag, Soundcloud, DailyMotion, ZippCast, ...) to SaveVideoBot and receive the media file just in a few seconds\n',
    '<b>I want to download a random funny video</b>',
    'Send /random to get random funny video\n',
    '<b>I want to search and then download a video</b>',
    'You can use magic @vid bot, just type @vid and then your search text (<i>ex: @vid Steve jobs</i>)\n',
    '<b>Enjoy!</b>'
  ].join('\n')

  await telegram.sendMessage(session, text, 'HTML')
}
