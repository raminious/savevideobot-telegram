'use strict'
const moment = require('moment')
const telegram = require('./telegram')

// const ad = {
//   tag: 'BQADBAADNWIZAAF6fgwHD1nLilLxtesC',
//   note: 'BQADBAADOGIZAAF6fgwHKkGG2zTrIa0C',
//   robot: 'BQADBAADOWIZAAF6fgwHJ9ZGeQMtkvEC',
//   autumn: 'BQADBAADPWIZAAF6fgwHoIwAAQPPAmiiAg'
// }

// const ad_week = [ ad.tag, ad.note, ad.autumn, ad.tag, ad.robot, ad.note, ad.robot ]

const advertisement = {}

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

advertisement.display = function* (session) {
  const photo = 'AgADBAADsqgxG_PqgVEBzPHM0amXNd8fWhkABJKVJIrNa9OOtloBAAEC'

  const caption = [
    '🤔میدونی مد امسال رو؟',
    '💄كانال خوشگلاسیون\n',
    '👗یه عالمه مدل لباس و مانتو شیك بهاره',
    'همینجا👇\n',
    'https://telegram.me/joinchat/AYKGSzwmO7uFT8X51Dhbdw',
    '\n\nMost Massive and Best Fashion Channel in the world 💅👌💯\n',
    '\n'
  ]

  yield telegram.sendPhoto(session, photo, caption.join('\n'))
  yield delay(3000)
  // telegram.sendSticker(session, ad_week[~~moment().day()], true)
}

module.exports = advertisement
