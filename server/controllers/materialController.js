const fs = require('fs');
const path = require('path');
const Material = require('../models/Material');

// @desc    Get all materials (with optional filters)
// @route   GET /api/materials
// @access  Private
const getMaterials = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.company) {
      filter.companyId = req.query.company;
    }

    if (req.query.job) {
      filter.jobId = req.query.job;
    }

    const materials = await Material.find(filter)
      .populate('companyId')
      .populate('jobId');

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single material
// @route   GET /api/materials/:id
// @access  Private
const getMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('companyId')
      .populate('jobId');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }

    res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload materials (multiple files)
// @route   POST /api/materials
// @access  Private/Admin
const uploadMaterials = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one file',
      });
    }

    const { companyId, jobId, title, description } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required',
      });
    }

    const createdMaterials = [];

    for (const file of req.files) {
      const materialData = {
        companyId,
        title: title || file.originalname,
        description: description || '',
        filePath: file.path,
      };

      if (jobId) {
        materialData.jobId = jobId;
      }

      const material = await Material.create(materialData);
      createdMaterials.push(material);
    }

    res.status(201).json({
      success: true,
      count: createdMaterials.length,
      data: createdMaterials,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update material (title/description, optionally replace file)
// @route   PUT /api/materials/:id
// @access  Private/Admin
const updateMaterial = async (req, res, next) => {
  try {
    let material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }

    const updateData = {};

    if (req.body.title) {
      updateData.title = req.body.title;
    }

    if (req.body.description !== undefined) {
      updateData.description = req.body.description;
    }

    // Optionally replace file
    if (req.file) {
      // Delete old file
      if (material.filePath) {
        const oldFilePath = path.resolve(material.filePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updateData.filePath = req.file.path;
    }

    material = await Material.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private/Admin
const deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }

    // Remove file from disk
    if (material.filePath) {
      const filePath = path.resolve(material.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Material.findByIdAndDelete(material._id);

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download material file
// @route   GET /api/materials/download/:id
// @access  Private
const downloadMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }

    const filePath = path.resolve(material.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server',
      });
    }

    res.download(filePath);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaterials,
  getMaterial,
  uploadMaterials,
  updateMaterial,
  deleteMaterial,
  downloadMaterial,
};
