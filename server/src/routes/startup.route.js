const express = require('express');

const {
  createStartup,
  getStartups,
  getStartup,
  updateStartup,
  deleteStartup,
} = require('../controllers/startup.controller');

const { requireAuth } = require('../middleware/auth');

const {
  requireFounder,
  validateStartupId,
  validateCreateStartup,
  validateUpdateStartup,
  validateStartupQuery,
} = require('../middleware/startup.middleware');

const router = express.Router();

router.route('/')
  .get(validateStartupQuery, getStartups)
  .post(
    requireAuth,
    requireFounder,
    validateCreateStartup,
    createStartup
  );

router.route('/:id')
  .get(
    validateStartupId,
    getStartup
  )
  .patch(
    requireAuth,
    requireFounder,
    validateStartupId,
    validateUpdateStartup,
    updateStartup
  )
  .delete(
    requireAuth,
    requireFounder,
    validateStartupId,
    deleteStartup
  );

module.exports = router;