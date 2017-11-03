const cache = require('../cache')

const prefix = 'telegram_file_'

const File = {}

function getKey({id, format, bot}) {
  return [id, format, bot].join('-')
}

File.find = async function(id, format, bot) {
  const key = getKey({id, format, bot})
  return await cache.find(prefix + key)
}

File.create = function({id, format, bot, type, file_id}) {
  const key = getKey({id, format, bot})
  cache.save(key, {file_id, type}, 24 * 60 * 60)
}

module.exports = File
