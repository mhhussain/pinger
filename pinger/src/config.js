const _ = require('lodash');
require('dotenv').config();
module.exports = {
  PORT: _.defaultTo(process.env.PORT, 9002),
  MORGAN_FORMAT: _.defaultTo(process.env.MORGAN_FORMAT, 'tiny'),
  COORDINATOR_URL: _.defaultTo(process.env.COORDINATOR_URL, 'localhost'),
  COORDINATOR_PORT: _.defaultTo(process.env.COORDINATOR_PORT, 5001),
  PROCESS_INTERVAL: _.defaultTo(process.env.PROCESS_INTERVAL, 3000),
  RANDOM_PERCENT: _.defaultTo(process.env.RANDOM_PERCENT, 0)
};