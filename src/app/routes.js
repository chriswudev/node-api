'use strict';

const controller = require('../controller');
const authController = controller.authController;
const userController = controller.userController;

module.exports = function (router) {
  router.post(
    '/login',
    authController.authenticate,
    authController.serialize,
    authController.generateToken,
    authController.sendAuthData
  );
  router.post(
    '/logout',
    authController.checkAccessToken,
    authController.checkAccessTokenValid,
    authController.logout
  );

  // Use this route for rest queries of authenticated users
  router.post(
    '/rest/*',
    authController.checkAccessToken,
    authController.checkAccessTokenValid
  );

  router.post('/rest/user/load-logged-in', userController.loadLoggedIn);
  router.post('/rest/user/all', userController.loadAll);
  router.post('/rest/user/save', userController.save);
  router.post('/rest/user/remove', userController.remove);
  router.post('/rest/user/already-exist', userController.checkAlreadyExist);
};
