const Hubspot = require('hubspot');
const hubConfig = require('../config.json');

module.exports = new Hubspot(hubConfig);