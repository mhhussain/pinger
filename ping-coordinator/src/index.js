const e = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

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

// GLOBAL MAP REGISTRATION
const hostname = uuidv4();
var global_map = [];

// STARTUP PROCESS
const startup = async () => {
  var i = 1;
  logger.info(`Running startup process`);
  const process = async () => {
    // clone global map for loop safety
    const gmap_clone = _.cloneDeep(global_map);
    var new_gmap = [];
    logger.info(`Running process [${i++}]`);
    await _.each(gmap_clone, async (v) => {
      const testhost = `http://${v.hostname}:${v.port}/${v.route}`;
      logger.info(`Testing host [${testhost}]`);
      await axios.get(testhost)
        .then(res => {
          logger.info(`Host passed [${v.hostname}]`);
          new_gmap.push(v);
        })
        .catch(e => {
          console.log(e.message);
          logger.info(`Host failed [${v.hostname}]`);
          //new_gmap = _.filter(gmap_clone, (o) => { return o.hostname != v.hostname; });
          logger.info(`Host removed [${v.hostname}]`);
        });
    });

    global_map = new_gmap;
  };

  const int = await setInterval(process, 1000);
};

// REGISTER ROUTES
app.post('/register', (req, res) => {
  const { registration } = req.body;

  if (_.find(global_map, (o) => { return o.hostname == registration.host && o.port == registration.port; }) === undefined) {
    logger.info(`Registering host [[${registration.host}]]`);
    global_map.push({ hostname: registration.host, port: registration.port, route: registration.route });
    res.json(true);
  } else {
    logger.info(`Host [[${registration.host}]] already registered`);
    res.json(false);
  }
});

app.get('/map', (req, res) => {
  res.json(global_map);
});

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
