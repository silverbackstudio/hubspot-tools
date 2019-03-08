const Hubspot = require('hubspot');
const hubConfig = require('../config.json');

exports.constants = require('./constants');
exports.client = new Hubspot(hubConfig);