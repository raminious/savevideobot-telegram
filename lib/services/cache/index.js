const client = require('../../adapters/redis')
const prefix = 'svb_telegram_'

const Cache = {}

Cache.find = async function(key) {
  const result = await client.getAsync(prefix + key)
  return result ? JSON.parse(result) : null
}

Cache.save = function(key, data, expire) {
	expire = expire || 3600

  return new Promise((resolve, reject) => {
  	client.set(prefix + key, JSON.stringify(data), (err, reply) => {
  		if (err) {
        return reject(err)
      }

    	client.expire(prefix + key, expire)
  		return resolve()
  	})
  })
}

Cache.remove = function(key) {
	client.del(prefix + key)
}

module.exports = Cache
