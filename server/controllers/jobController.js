const Job = require('../models/Job');
const Company = require('../models/Company');
const Material = require('../models/Material');
const Application = require('../models/Application');
const PlacementResult = require('../models/PlacementResult');

// @desc    Get all jobs (with optional filters)
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.company) {
      filter.companyId = req.query.company;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const jobs = await Job.find(filter).populate('companyId');

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('companyId');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private/Admin
const createJob = async (req, res, next) => {
  try {
    // Verify companyId exists
    const company = await Company.findById(req.body.companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Admin
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job (cascade delete related data)
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Cascade delete related documents
    await Material.deleteMany({ jobId: job._id });
    await Application.deleteMany({ jobId: job._id });
    await PlacementResult.deleteMany({ jobId: job._id });

    await Job.findByIdAndDelete(job._id);

    res.status(200).json({
      success: true,
      message: 'Job and all related data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
