const express = require('express');

const {
  register,
  userLogin,
  userLogout,
  checkAuth,
  refreshAccessToken,
} = require('../controllers/user.controller');

const {
  validateRegister,
  validateLogin,
} = require('../middleware/user.validation');

const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.route('/register').post(validateRegister, register);
router.route('/login').post(validateLogin, userLogin);
router.route('/refresh').post(refreshAccessToken);
router.route('/logout').post(userLogout);
router.route('/me').get(requireAuth, checkAuth);

module.exports = router;