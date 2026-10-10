const Startup = require('../models/startup.model');
const { AppError } = require('../middleware/errors');

function escapeSearchText(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findOwnedStartup(startupId, userId) {
  const startup = await Startup.findById(startupId);

  if (!startup) {
    throw new AppError(404, 'Startup not found.');
  }

  if (!startup.owner.equals(userId)) {
    throw new AppError(403, 'You can only manage your own startup profiles.');
  }

  return startup;
}

async function createStartup(req, res, next) {
  try {
    const startup = await Startup.create({
      ...req.body,
      owner: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Startup created successfully.',
      startup,
    });
  } catch (error) {
    next(error);
  }
}

async function getStartups(req, res, next) {
  try {
    const {
      search,
      industry,
      stage,
      status,
      page,
      limit,
    } = req.validatedQuery;

    const filters = {};

    if (industry) {
      filters.industry = new RegExp(escapeSearchText(industry.trim()), 'i');
    }

    if (stage) {
      filters.stage = stage;
    }

    if (status) {
      filters.status = status;
    }

    if (search) {
      const searchPattern = new RegExp(escapeSearchText(search), 'i');

      filters.$or = [
        { name: searchPattern },
        { tagline: searchPattern },
      ];
    }

    const skip = (page - 1) * limit;

    const [startups, total] = await Promise.all([
      Startup.find(filters)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Startup.countDocuments(filters),
    ]);

    return res.status(200).json({
      success: true,
      startups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getStartup(req, res, next) {
  try {
    const startup = await Startup.findById(req.params.id).lean();

    if (!startup) {
      throw new AppError(404, 'Startup not found.');
    }

    return res.status(200).json({
      success: true,
      startup,
    });
  } catch (error) {
    next(error);
  }
}

async function updateStartup(req, res, next) {
  try {
    await findOwnedStartup(req.params.id, req.user._id);

    const startup = await Startup.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user._id,
      },
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!startup) {
      throw new AppError(404, 'Startup not found.');
    }

    return res.status(200).json({
      success: true,
      message: 'Startup updated successfully.',
      startup,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteStartup(req, res, next) {
  try {
    await findOwnedStartup(req.params.id, req.user._id);

    const startup = await Startup.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!startup) {
      throw new AppError(404, 'Startup not found.');
    }

    return res.status(200).json({
      success: true,
      message: 'Startup deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createStartup,
  getStartups,
  getStartup,
  updateStartup,
  deleteStartup,
};