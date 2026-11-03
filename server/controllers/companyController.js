const fs = require('fs');
const path = require('path');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Material = require('../models/Material');
const Application = require('../models/Application');
const Announcement = require('../models/Announcement');
const PlacementResult = require('../models/PlacementResult');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private
const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ companyName: 1 });

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company with associated jobs
// @route   GET /api/companies/:id
// @access  Private
const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Fetch associated jobs
    const jobs = await Job.find({ companyId: company._id });

    res.status(200).json({
      success: true,
      data: {
        ...company.toObject(),
        jobs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a company
// @route   POST /api/companies
// @access  Private/Admin
const createCompany = async (req, res, next) => {
  try {
    const companyData = { ...req.body };

    // Handle logo upload
    if (req.file) {
      companyData.logo = req.file.path;
    }

    const company = await Company.create(companyData);

    res.status(201).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a company
// @route   PUT /api/companies/:id
// @access  Private/Admin
const updateCompany = async (req, res, next) => {
  try {
    let company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    const updateData = { ...req.body };

    // Handle logo replacement
    if (req.file) {
      // Delete old logo if it exists
      if (company.logo) {
        const oldLogoPath = path.resolve(company.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      updateData.logo = req.file.path;
    }

    company = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a company (cascade delete all related data)
// @route   DELETE /api/companies/:id
// @access  Private/Admin
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Delete company logo from disk
    if (company.logo) {
      const logoPath = path.resolve(company.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    // Delete associated material files from disk
    const materials = await Material.find({ companyId: company._id });
    for (const material of materials) {
      if (material.filePath) {
        const filePath = path.resolve(material.filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    // Cascade delete all related documents
    await Job.deleteMany({ companyId: company._id });
    await Material.deleteMany({ companyId: company._id });
    await Application.deleteMany({ companyId: company._id });
    await Announcement.deleteMany({ companyId: company._id });
    await PlacementResult.deleteMany({ companyId: company._id });

    await Company.findByIdAndDelete(company._id);

    res.status(200).json({
      success: true,
      message: 'Company and all related data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
};
