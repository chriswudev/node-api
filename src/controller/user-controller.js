'use strict';

const model = require('../model');
const userModel = model.userModel;

const core = require('../core');
const controllerUtils = core.controllerUtils;
const HTTP_CODES = core.HTTP_CODE;

module.exports.loadAll = function (req, res, next) {
  userModel
    .loadAll()
    .then((users) => res.json(users))
    .catch(next);
};

module.exports.save = function (req, res, next) {
  let user = controllerUtils.extractObjectFromRequest(req);
  if (user) {
    userModel
      .save(user)
      .then((user) => res.status(HTTP_CODES.OK).send(user))
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request');
  }
};

module.exports.remove = function (req, res, next) {
  let id = controllerUtils.extractIdFromRequest(req);
  if (id) {
    userModel
      .removeById(id)
      .then(() => res.send())
      .catch(next);
  } else {
    res.status(400).send('Incorrect request');
  }
};

module.exports.loadLoggedIn = function (req, res, next) {
  let userId = req.user.id;
  if (userId) {
    userModel
      .findById(userId)
      .then((user) => {
        user
          ? res.status(HTTP_CODES.OK).send(user)
          : res.status(HTTP_CODES.UNAUTHORIZED).send('User no longer exist');
      })
      .catch(next);
  } else {
    res.status(HTTP_CODES.UNAUTHORIZED).send();
  }
};

module.exports.checkAlreadyExist = function (req, res, next) {
  let usernameOrEmail = req.body ? req.body.value : '';
  let id = req.body ? req.body.objectId : '';
  if (usernameOrEmail) {
    userModel
      .findByUsernameOrEmail(usernameOrEmail)
      .then((user) =>
        res.status(HTTP_CODES.OK).json({ unique: !user || user.id === id })
      )
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request');
  }
};
