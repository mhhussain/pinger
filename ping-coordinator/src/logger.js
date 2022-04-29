const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp}|${level}|${label}|||${message}`;
});

const configs = {
  level: 'info',
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
};

const loggerWrapper = (tag) => {
  const loggerConfig = {
    ...configs,
    format: combine(
      label({ label: tag }),
      timestamp(),
      customFormat,
    ),
  };
  return createLogger(loggerConfig);
};

module.exports = {
  logger: loggerWrapper,
};