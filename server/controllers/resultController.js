const PlacementResult = require('../models/PlacementResult');

// @desc    Get placement results
// @route   GET /api/results
// @access  Private
const getResults = async (req, res, next) => {
  try {
    let filter = {};

    // Students can only see published results
    if (req.user.role === 'student') {
      filter.published = true;
    }

    const results = await PlacementResult.find(filter)
      .populate('companyId')
      .populate('jobId')
      .populate('selectedStudents', 'name enrollmentNumber branch')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a placement result
// @route   POST /api/results
// @access  Private/Admin
const createResult = async (req, res, next) => {
  try {
    const result = await PlacementResult.create(req.body);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a placement result
// @route   PUT /api/results/:id
// @access  Private/Admin
const updateResult = async (req, res, next) => {
  try {
    let result = await PlacementResult.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Placement result not found',
      });
    }

    const updateData = { ...req.body };

    // If setting published to true, also set publishedAt
    if (updateData.published === true && !result.published) {
      updateData.publishedAt = Date.now();
    }

    result = await PlacementResult.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a placement result
// @route   DELETE /api/results/:id
// @access  Private/Admin
const deleteResult = async (req, res, next) => {
  try {
    const result = await PlacementResult.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Placement result not found',
      });
    }

    await PlacementResult.findByIdAndDelete(result._id);

    res.status(200).json({
      success: true,
      message: 'Placement result deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResults,
  createResult,
  updateResult,
  deleteResult,
};
