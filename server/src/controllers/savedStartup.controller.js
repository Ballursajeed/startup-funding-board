const User = require('../models/user.model');
const Startup = require('../models/startup.model');
const { AppError } = require('../middleware/errors');

async function saveStartup(req, res, next) {
  try {
    const startupId = req.params.id;

    const startupExists = await Startup.exists({ _id: startupId });

    if (!startupExists) {
      throw new AppError(404, 'Startup not found.');
    }

    const result = await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { savedStartups: startupId } }
    );

    if (result.matchedCount === 0) {
      throw new AppError(401, 'User no longer exists.');
    }

    return res.status(200).json({
      success: true,
      message: 'Startup saved successfully.',
      startupId,
    });
  } catch (error) {
    next(error);
  }
}

async function unsaveStartup(req, res, next) {
  try {
    const startupId = req.params.id;

    const result = await User.updateOne(
      { _id: req.user._id },
      { $pull: { savedStartups: startupId } }
    );

    if (result.matchedCount === 0) {
      throw new AppError(401, 'User no longer exists.');
    }

    return res.status(200).json({
      success: true,
      message: 'Startup removed from saved list.',
      startupId,
    });
  } catch (error) {
    next(error);
  }
}

async function getSavedStartups(req, res, next) {
  try {
    const savedStartupIds = req.user.savedStartups || [];

    const startups = await Startup.find({
      _id: { $in: savedStartupIds },
    })
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      startups,
      total: startups.length,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  saveStartup,
  unsaveStartup,
  getSavedStartups,
};