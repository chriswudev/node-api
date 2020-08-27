'use strict';

const _ = require('lodash');

module.exports.prepareForClient = function (obj, fields) {
  if (obj && fields) {
    let data = {};
    _.forEach(fields, (field) => {
      data[field] = obj[field];
    });
    obj = data;
  }
  return obj;
};
