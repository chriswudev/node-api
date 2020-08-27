'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const passport = require('passport');
const morgan = require('morgan');
const errorhandler = require('errorhandler');
const userData = require('./data/user');

const env = require('../env');
const routes = require('./routes');

const controller = require('../controller');
const authController = controller.authController;
const mainController = controller.mainController;

const model = require('../model');
const configModel = model.configModel;

const database = require('../database');
const sequelize = database.sequelize;

class Server {
  constructor() {
    this._started = false;
    this._errorHandler = null;

    console.info(`Environment: ${env.NODE_ENV}`);
    passport.use(authController.localStrategy);
  }

  _initApp() {
    this._app = express();
    let rootRouter = express.Router();

    this._app.use(morgan('combined'));

    this._app.use(bodyParser.json());
    this._app.use(mainController.addHeaders);
    this._app.use(passport.initialize());
    this._app.use(passport.session());

    routes(rootRouter);
    this._app.use('/', rootRouter);

    this._initErrorHandler();
  }

  _initErrorHandler() {
    if (this._errorHandler) {
      this._app.use(this._errorHandler);
    } else if (env.NODE_ENV === env.ENV_TYPE.development) {
      this._app.use(errorhandler({ log: (err) => console.error(err) }));
    } else {
      this._app.use(mainController.errorHandler);
    }
  }

  _loadInitialData(initializationKey, initializationHandler) {
    initializationKey = `${Server.APPLICATION_INITIALIZATION_KEY}.data.${initializationKey}`;
    return sequelize.transaction((transaction) => {
      return configModel
        .findByKey(initializationKey, transaction)
        .then((key) => {
          if (!key || !key.value) {
            return initializationHandler(transaction).then(() =>
              configModel.save(
                { key: initializationKey, value: 1 },
                transaction
              )
            );
          }
        });
    });
  }

  _loadAppData() {
    return this._loadInitialData('user', userData.init);
  }

  _startServices() {
    let httpsOptions = null;

    /* Load https certificates */
    if (!env.HTTPS_DISABLED) {
      let key = fs.readFileSync(env.PRIVATE_KEY, 'utf8');
      let cert = fs.readFileSync(env.PUBLIC_KEY, 'utf8');
      httpsOptions = { key: key, cert: cert };
    }

    return new Promise((resolve) => {
      if (httpsOptions) {
        https.createServer(httpsOptions, this._app).listen(env.PORT, () => {
          console.log('Https server is running on port', env.PORT);
          resolve();
        });
      } else {
        this._app.listen(env.PORT, () => {
          console.log('Http server is running on port', env.PORT);
          resolve();
        });
      }
    });
  }

  start() {
    if (!this._started) {
      this._started = true;
    } else {
      return;
    }
    this._initApp();
    return model
      .init()
      .then(() => this._loadAppData())
      .then(() => this._startServices());
  }
}

Server.APPLICATION_INITIALIZATION_KEY = 'app.initialized';

module.exports = new Server();
