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
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// STARTUP PROCESS
const startup = async () => {
  var i = 1;
  logger.info(`Running startup process`);

  const pingerRegistration = {
    host: 'localhost',
    port: 5002,
    route: 'ping',
  }

  const reg = await axios.post(`http://localhost:5001/register`, { registration: pingerRegistration });

  // interval process
  const process = async () => {
    logger.info(`Running process [${i++}]`);
    const res = await axios.get(`http://localhost:5001/map`);
    console.log(res.data);
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
