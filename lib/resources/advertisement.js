'use strict'
const moment = require('moment')
const telegram = require('./telegram')

const ad = {
  tag: 'BQADBAADNWIZAAF6fgwHD1nLilLxtesC',
  note: 'BQADBAADOGIZAAF6fgwHKkGG2zTrIa0C',
  robot: 'BQADBAADOWIZAAF6fgwHJ9ZGeQMtkvEC',
  autumn: 'BQADBAADPWIZAAF6fgwHoIwAAQPPAmiiAg'
}

const ad_week = [ ad.tag, ad.note, ad.autumn, ad.tag, ad.robot, ad.note, ad.robot ]

const advertisement = {}

advertisement.display = function(session) {
	telegram.sendSticker(session, ad_week[~~moment().day()], true)
}

module.exports = advertisement
