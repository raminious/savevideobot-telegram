'use strict'

const db = require('../mongo')
const Schema = db.Schema

const schema = new Schema({
  media_id: String,
  url: String,
  type: String,
  format: String,
  file_id: String
}, {
  timestamps: { created_at: 'created_at' }
})

const File = db.model('file', schema)

module.exports = {

  find: function* (criteria){
    return yield File.findOne(criteria)
  },
  create: function* (data) {
    const f = new File({
      media_id: data.media_id,
      url: data.url,
      type: data.type,
      format: data.format,
      file_id: data.file_id
    })
    return yield f.save()
  }
}
