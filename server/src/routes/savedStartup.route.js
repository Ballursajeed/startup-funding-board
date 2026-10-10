const express = require('express');

const {
  saveStartup,
  unsaveStartup,
  getSavedStartups,
} = require('../controllers/savedStartup.controller');

const { requireAuth } = require('../middleware/auth');

const {
  validateStartupId,
} = require('../middleware/startup.middleware');

const router = express.Router();

router.use(requireAuth);

router.route('/')
  .get(getSavedStartups);

router.route('/:id')
  .put(validateStartupId, saveStartup)
  .delete(validateStartupId, unsaveStartup);

module.exports = router;