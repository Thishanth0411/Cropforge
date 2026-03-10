const path  = require('path');
const fs    = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const Image = require('../models/Image');
const Crop  = require('../models/Crop');

const cropsDir = path.join(__dirname, '../uploads/crops');
if (!fs.existsSync(cropsDir)) fs.mkdirSync(cropsDir, { recursive: true });

// @route  POST /api/crops
exports.cropImage = async (req, res) => {
  try {
    const { imageId, cropX, cropY, cropWidth, cropHeight, outputWidth, outputHeight, sizeLabel, format = 'jpeg', quality = 95, dpi = 300 } = req.body;

    const image = await Image.findOne({ _id: imageId, user: req.user._id });
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

    const ext      = format === 'jpeg' ? 'jpg' : format;
    const outName  = `crop_${uuidv4()}.${ext}`;
    const outPath  = path.join(cropsDir, outName);

    // Perform crop + resize with Sharp (high quality)
    let pipeline = sharp(image.path)
      .extract({
        left:   Math.round(cropX),
        top:    Math.round(cropY),
        width:  Math.round(cropWidth),
        height: Math.round(cropHeight),
      })
      .resize(Math.round(outputWidth), Math.round(outputHeight), {
        fit: 'fill',
        kernel: sharp.kernel.lanczos3,
      });

    if (format === 'jpeg') pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    else if (format === 'png') pipeline = pipeline.png({ compressionLevel: 9 });
    else if (format === 'webp') pipeline = pipeline.webp({ quality });

    const info = await pipeline.withMetadata({ density: dpi }).toFile(outPath);

    const crop = await Crop.create({
      user: req.user._id, sourceImage: imageId,
      croppedFilename: outName, croppedPath: outPath,
      cropX, cropY, cropWidth, cropHeight,
      outputWidth: info.width, outputHeight: info.height,
      sizeLabel, format, quality, dpi,
      fileSize: info.size,
    });

    res.status(201).json({ success: true, crop, downloadUrl: `/api/crops/download/${crop._id}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/crops/bulk
exports.bulkCrop = async (req, res) => {
  try {
    const { jobs } = req.body; // array of crop job objects
    if (!Array.isArray(jobs) || jobs.length === 0)
      return res.status(400).json({ success: false, message: 'No crop jobs provided' });

    const results = [];
    for (const job of jobs) {
      const { imageId, cropX, cropY, cropWidth, cropHeight, outputWidth, outputHeight, sizeLabel, format = 'jpeg', quality = 95, dpi = 300 } = job;
      const image = await Image.findOne({ _id: imageId, user: req.user._id });
      if (!image) { results.push({ imageId, error: 'Not found' }); continue; }

      const ext     = format === 'jpeg' ? 'jpg' : format;
      const outName = `crop_${uuidv4()}.${ext}`;
      const outPath = path.join(cropsDir, outName);

      let pipeline = sharp(image.path)
        .extract({ left: Math.round(cropX), top: Math.round(cropY), width: Math.round(cropWidth), height: Math.round(cropHeight) })
        .resize(Math.round(outputWidth), Math.round(outputHeight), { fit: 'fill', kernel: sharp.kernel.lanczos3 });

      if (format === 'jpeg') pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      else if (format === 'png') pipeline = pipeline.png({ compressionLevel: 9 });
      else if (format === 'webp') pipeline = pipeline.webp({ quality });

      const info = await pipeline.withMetadata({ density: dpi }).toFile(outPath);

      const crop = await Crop.create({
        user: req.user._id, sourceImage: imageId,
        croppedFilename: outName, croppedPath: outPath,
        cropX, cropY, cropWidth, cropHeight,
        outputWidth: info.width, outputHeight: info.height,
        sizeLabel, format, quality, dpi, fileSize: info.size,
      });
      results.push({ imageId, cropId: crop._id, downloadUrl: `/api/crops/download/${crop._id}` });
    }
    res.status(201).json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/crops
exports.getCropHistory = async (req, res) => {
  try {
    const crops = await Crop.find({ user: req.user._id })
      .populate('sourceImage', 'originalName filename')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, count: crops.length, crops });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/crops/download/:id
exports.downloadCrop = async (req, res) => {
  try {
    const crop = await Crop.findOne({ _id: req.params.id, user: req.user._id });
    if (!crop || !fs.existsSync(crop.croppedPath))
      return res.status(404).json({ success: false, message: 'Cropped file not found' });

    const label = crop.sizeLabel ? `_${crop.sizeLabel}` : '';
    res.download(crop.croppedPath, `cropforge${label}.${crop.format === 'jpeg' ? 'jpg' : crop.format}`);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/crops/:id
exports.deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findOne({ _id: req.params.id, user: req.user._id });
    if (!crop) return res.status(404).json({ success: false, message: 'Not found' });
    if (fs.existsSync(crop.croppedPath)) fs.unlinkSync(crop.croppedPath);
    await crop.deleteOne();
    res.json({ success: true, message: 'Crop deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
