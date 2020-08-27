'use strict';

const _ = require('lodash');
const accessTokenModel = require('./access-token-model');
const userModel = require('./user-model');
const configModel = require('./config-model');

const database = require('../database');
const sequelize = database.sequelize;

const core = require('../core');
const Model = core.Model;

const init = function () {
  let promises = [];
  _.forEach(module.exports, (moduleMember) => {
    if (moduleMember instanceof Model) {
      let res = moduleMember.init();
      res instanceof Promise && promises.push(res);
    }
  });
  return Promise.all(promises).then(() => sequelize.sync({ force: false }));
};

module.exports = {
  init,
  configModel,
  accessTokenModel,
  userModel,
};
