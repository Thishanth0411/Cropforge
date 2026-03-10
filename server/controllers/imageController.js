const path  = require('path');
const fs    = require('fs');
const sharp = require('sharp');
const Image = require('../models/Image');

// @route  POST /api/images/upload
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: 'No files uploaded' });

    const saved = [];
    for (const file of req.files) {
      // Get dimensions with sharp
      const meta = await sharp(file.path).metadata();
      const img  = await Image.create({
        user:         req.user._id,
        originalName: file.originalname,
        filename:     file.filename,
        path:         file.path,
        mimetype:     file.mimetype,
        size:         file.size,
        width:        meta.width,
        height:       meta.height,
      });
      saved.push(img);
    }
    res.status(201).json({ success: true, count: saved.length, images: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/images
exports.getImages = async (req, res) => {
  try {
    const images = await Image.find({ user: req.user._id }).sort({ uploadedAt: -1 });
    res.json({ success: true, count: images.length, images });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/images/:id
exports.deleteImage = async (req, res) => {
  try {
    const image = await Image.findOne({ _id: req.params.id, user: req.user._id });
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

    // Remove file from disk
    if (fs.existsSync(image.path)) fs.unlinkSync(image.path);
    await image.deleteOne();
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
