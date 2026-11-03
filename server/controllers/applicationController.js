const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private/Student
const applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required',
      });
    }

    // Get job and check existence
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check job status is Open
    if (job.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: 'This job is not open for applications',
      });
    }

    // Check deadline (end of the deadline day)
    if (job.deadline) {
      const deadlineEnd = new Date(job.deadline);
      deadlineEnd.setHours(23, 59, 59, 999);
      if (deadlineEnd < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Application deadline has passed',
        });
      }
    }

    // Check CGPA eligibility
    const studentCGPA = req.user.cgpa || 0;
    if (studentCGPA < job.minimumCGPA) {
      return res.status(400).json({
        success: false,
        message: `Minimum CGPA requirement is ${job.minimumCGPA}. Your CGPA is ${studentCGPA}`,
      });
    }

    // Check branch eligibility (if eligibleBranches is not empty)
    if (
      job.eligibleBranches &&
      job.eligibleBranches.length > 0 &&
      req.user.branch
    ) {
      if (!job.eligibleBranches.includes(req.user.branch)) {
        return res.status(400).json({
          success: false,
          message: `Your branch '${req.user.branch}' is not eligible for this job`,
        });
      }
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      studentId: req.user._id,
      jobId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job',
      });
    }

    // Create application
    const application = await Application.create({
      studentId: req.user._id,
      companyId: job.companyId,
      jobId,
    });

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my applications (student)
// @route   GET /api/applications/my
// @access  Private/Student
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate('companyId')
      .populate('jobId')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for a specific job (admin)
// @route   GET /api/applications/job/:jobId
// @access  Private/Admin
const getJobApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('studentId', 'name email enrollmentNumber phone branch semester cgpa resume')
      .populate('companyId')
      .populate('jobId')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (admin)
// @route   PUT /api/applications/:id
// @access  Private/Admin
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Validate status enum
    const validStatuses = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    let application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
};
