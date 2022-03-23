const e = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const os = require('os');

const _ = require('lodash');
const logger = require('./logger').logger('app');

const configs = require('./config');

const app = e();
app.use(cors());
app.use(helmet());
app.use(morgan(configs.MORGAN_FORMAT));
app.use(e.json());

// APP PING
var INTERNAL_PING_COUNTER = 0;
app.get('/ping', (req, res) => {
  res.json({ count: INTERNAL_PING_COUNTER });
});

app.get('/ping/count', (req, res) => {
  res.json({ count: INTERNAL_PING_COUNTER });
});

// STARTUP PROCESS
const startup = async () => {
  var i = 1;
  INTERNAL_PING_COUNTER = 0;
  logger.info(`Running startup process`);

  const pingerRegistration = {
    host: os.hostname(),
    port: configs.PORT,
    route: 'ping',
  }

  const coordinatorurl = `http://${configs.COORDINATOR_URL}:${configs.COORDINATOR_PORT}`;

  const reg = await axios.post(`${coordinatorurl}/register`, { registration: pingerRegistration });

  // interval process
  const process = async () => {
    logger.info(`Running process [${i++}]`);
    var { data: hosts } = await axios.get(`${coordinatorurl}/map`);
    logger.info(`Retrieved new hosts list count [${hosts.length}]`);

    if (hosts.length === 0) {
      await axios.post(`${coordinatorurl}/register`, { registration: pingerRegistration });
      logger.info(`Re-registering host`);

      const { data } = await axios.get(`${coordinatorurl}/map`);
      hosts = data;
      logger.info(`Retrieved new hosts list count [${hosts.length}]`);
    }

    _.forEach(hosts, async (v) => {
      const hosturl = `http://${v.hostname}:${v.port}/${v.route}`;
      logger.info(`Pinging host ${hosturl}`);
      try {
        const pingResponse = await axios.get(`http://${v.hostname}:${v.port}/${v.route}`);
        logger.info(`Ping successful on host ${hosturl}`);
        logger.info(`Ping incremented ${++INTERNAL_PING_COUNTER}`);
      } catch {
        logger.info(`Ping failed on host ${hosturl}`);
      }

    })
  };

  const int = setInterval(process, 3000);
};

// ERRORS
app.use((e, req, res, next) => {
  if (e.status) {
    res.status(e.status);
  } else {
    res.status(500);
  }
  res.json({
    message: e.message,
    stack: process.env.NODE_ENV === 'production' ? 'NA' : e.stack,
  });
});

app.listen(configs.PORT, () => {
  logger.info(`Listening at http://localhost:${configs.PORT}`);
});

startup();
