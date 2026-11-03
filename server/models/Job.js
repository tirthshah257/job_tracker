const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    description: {
      type: String,
    },
    requiredSkills: {
      type: [String],
    },
    eligibilityCriteria: {
      type: String,
    },
    minimumCGPA: {
      type: Number,
      default: 0,
      min: [0, 'Minimum CGPA cannot be less than 0'],
      max: [10, 'Minimum CGPA cannot be more than 10'],
    },
    eligibleBranches: {
      type: [String],
    },
    package: {
      type: String,
    },
    deadline: {
      type: Date,
    },
    recruitmentProcess: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Open', 'Closed'],
      default: 'Upcoming',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Job', jobSchema);
