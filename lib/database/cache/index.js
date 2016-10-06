'use strict'

const client = require('../redis')
const prefix = 'svb_telegram_'

const cache = {}

cache.find = function* (key) {
  let data = yield client.getAsync(prefix+key)
  return data? JSON.parse(data): null
}

cache.save = function(key, data, expire) {

	expire = expire || 3600

  return new Promise((resolve, reject) => {

  	client.set(prefix+key, JSON.stringify(data), (err, reply) => {
  		if (err) return reject(err)

    	client.expire(prefix+key, expire)
  		return resolve()
  	})
  })
}

cache.remove = function(key) {
	client.del(key)
}

module.exports = cache
