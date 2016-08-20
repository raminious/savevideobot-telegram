'use strict'

const request = require('superagent');
const config = require('../../../config.json');
const User = require('../../user');
const telegram = require('../../util/telegram')(config.token);

module.exports = function* (user, message) {


}
