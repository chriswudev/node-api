'use strict';

const _ = require('lodash');
const env = require('../../env');

const model = require('../../model');
const userModel = model.userModel;

module.exports.init = function (transaction) {
  return userModel.save(
    {
      username: env.DEFAULT_ADMINISTRATOR_NAME,
      firstName: 'Eric',
      lastName: 'Smith',
      password: env.DEFAULT_ADMINISTRATOR_PASSWORD,
    },
    transaction
  );
};
