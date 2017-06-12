'use strict';

var winston = require('winston');

let log = new winston.Logger({
  level: 'error',
  transports: [
    new (winston.transports.Console)()
  ]
});

module.exports = log
