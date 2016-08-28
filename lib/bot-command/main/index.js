'use strict'

const request = require('superagent')
const config = require('../../../config.json')
const telegram = require('../../resources/telegram')(config.token)

module.exports = function* (user, message) {

  const text = [
    'Welcome to <b>SaveVideoBot</b>\n',
    '<b>What is SaveVideoBot ?</b>',
    '@SaveVideoBot is the biggest video and audio downloader bot on Telegram messenger\n',
    '<b>I want to download a video and keep it offline</b>',
    'Okay, Send video link from any video sharing websites (like Youtube, Vimeo, Instagram, 9gag, Soundcloud, DailyMotion, ZippCast, ...) to SaveVideoBot and receive the video file just in a few seconds\n',
    '<b>I want to download a random funny video</b>',
    'Send /random to get random funny video\n',
    '<b>I want to search and download videos</b>',
    'You can use magic @vid bot, just type @vid and then your search text (<i>ex: @vid Steve jobs</i>)\n',
    '<b>I want to advertise my businues or website on SaveVideoBot</b>',
    'Please contact with @svb_bot user on Telegram messenger\n\n',
    '<b>Enjoy!</b>'
  ].join('\n')

  yield telegram.sendMessage(user.id, text, 'HTML')
}
