const _ = require('lodash');
require('dotenv').config();
module.exports = {
  PORT: _.defaultTo(process.env.PORT, 9002),
  MORGAN_FORMAT: _.defaultTo(process.env.MORGAN_FORMAT, 'tiny'),
};