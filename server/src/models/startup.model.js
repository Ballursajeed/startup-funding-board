const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    tagline: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    stage: {
      type: String,
      required: true,
      enum: ['idea', 'pre-seed', 'seed', 'series-a'],
    },
    fundingGoal: {
      type: Number,
      required: true,
      min: 1,
      max: 1000000000000,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    status: {
      type: String,
      enum: ['fundraising', 'paused', 'funded'],
      default: 'fundraising',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

startupSchema.index({ owner: 1 });
startupSchema.index({ createdAt: -1, _id: -1 });
startupSchema.index({ industry: 1, stage: 1 });

module.exports = mongoose.model('Startup', startupSchema);