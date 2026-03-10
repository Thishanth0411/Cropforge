const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sourceImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: true,
  },
  croppedFilename: { type: String, required: true },
  croppedPath:     { type: String, required: true },
  // Crop parameters
  cropX:      { type: Number, required: true },
  cropY:      { type: Number, required: true },
  cropWidth:  { type: Number, required: true },
  cropHeight: { type: Number, required: true },
  // Output
  outputWidth:  { type: Number, required: true },
  outputHeight: { type: Number, required: true },
  sizeLabel:    { type: String },   // e.g. "12x18"
  format:       { type: String, enum: ['jpeg','png','webp'], default: 'jpeg' },
  quality:      { type: Number, default: 95 },
  dpi:          { type: Number, default: 300 },
  fileSize:     { type: Number },
  createdAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('Crop', CropSchema);
