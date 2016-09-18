'use strict';

var winston = require('winston');

let log = new winston.Logger({
  level: process.env.LOG_LEVEL || 'debug',
  transports: [
    new (winston.transports.Console)()
  ]
});

module.exports = log
