'use strict';

const jwt = require('jsonwebtoken');
const passport = require('passport');
const expressJwt = require('express-jwt');
const LocalStrategy = require('passport-local').Strategy;
const passwordHash = require('password-hash');

const model = require('../model');
const userModel = model.userModel;
const accessTokenModel = model.accessTokenModel;

const core = require('../core');
const HTTP_CODE = core.HTTP_CODE;

const AUTH_HEADER_PREFIX = 'Bearer ';

const sendInvalidAccessTokenError = function (res) {
  res.status(HTTP_CODE.UNAUTHORIZED).send('Invalid access token');
};

const extractAccessToken = function (req) {
  let authHeader = req.get('Authorization');
  if (authHeader) {
    authHeader = authHeader.startsWith(AUTH_HEADER_PREFIX)
      ? authHeader.substr(AUTH_HEADER_PREFIX.length - 1)
      : authHeader;
    authHeader = authHeader.trim();
  }
  return authHeader;
};

module.exports.generateToken = function (req, res, next) {
  req.token = jwt.sign({ id: req.user.id }, 'server secret', {
    expiresIn: '7d',
  });
  accessTokenModel
    .saveUserSession(req.user.id, req.token)
    .then(() => next())
    .catch(next);
};

module.exports.sendAuthData = function (req, res) {
  res.status(HTTP_CODE.OK).send({ token: req.token });
};

module.exports.checkAccessTokenValid = function (req, res, next) {
  if (req.user) {
    let accessToken = extractAccessToken(req);
    if (accessToken) {
      accessTokenModel
        .findByUserId(req.user.id)
        .then((validToken) =>
          !validToken || accessToken !== validToken.value
            ? sendInvalidAccessTokenError(res)
            : next()
        )
        .catch(() => sendInvalidAccessTokenError(res));
    } else {
      sendInvalidAccessTokenError(res);
    }
  } else {
    sendInvalidAccessTokenError(res);
  }
};

module.exports.serialize = function (req, res, next) {
  req.user = { id: req.user.id };
  next();
};

module.exports.localStrategy = new LocalStrategy(
  { usernameField: 'username', passwordField: 'password' },
  (username, password, done) => {
    userModel
      .loadAuthDataByByUsernameOrEmail(username)
      .then((authData) => {
        authData && passwordHash.verify(password, authData.password)
          ? done(null, authData)
          : done(null, false);
      })
      .catch(done);
  }
);

module.exports.logout = function (req, res, next) {
  accessTokenModel
    .clearUserSession(req.user.id)
    .then(() => {
      req.logout();
      res.sendStatus(HTTP_CODE.OK);
    })
    .catch(next);
};

module.exports.checkAccessToken = expressJwt({ secret: 'server secret' });

module.exports.authenticate = passport.authenticate('local', {
  session: false,
});
