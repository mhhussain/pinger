const e = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const fs = require('fs');
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

var CURRENT_MAP = {};
app.get('/map', (req, res) => {
  res.json(CURRENT_MAP);
})

// STARTUP PROCESS
const startup = async () => {
  var i = 1;
  INTERNAL_PING_COUNTER = 0;
  logger.info(`Running startup process`);

  const kubernetesApi = `https://kubernetes.default.svc/api/v1/namespaces/${configs.NAMESPACE}`;
  const authToken = fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8');

  // interval process
  const process = async () => {
    logger.info(`Running process [${i++}]`);
    var endpointHosts = await axios.get(
      `${kubernetesApi}/endpoints`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    var h = _.filter(endpointHosts.data.items, (i) => { return i.metadata.name === 'pinger' });
    var hosts = _.map(h[0].subsets[0].addresses, (a) => { return { hostname: a.ip, port: '5005', route: 'ping' } });

    logger.info(`Retrieved new hosts list count [${hosts.length}]`);

    CURRENT_MAP = hosts;

    _.forEach(hosts, async (v) => {
      const hosturl = `http://${v.hostname}:${v.port}/${v.route}`;

      const rnd = Math.ceil(Math.random() * 100);
      if (rnd > configs.RANDOM_PERCENT) {
        logger.info(`Pinging host ${hosturl}`);
        try {
          const pingResponse = await axios.get(`http://${v.hostname}:${v.port}/${v.route}`);
          logger.info(`Ping successful on host ${hosturl}`);
          logger.info(`Ping incremented ${++INTERNAL_PING_COUNTER}`);
        } catch {
          logger.info(`Ping failed on host ${hosturl}`);
        }
      }
    })
  };

  const int = setInterval(process, configs.PROCESS_INTERVAL);
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