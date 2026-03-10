const express = require('express');
const router  = express.Router();
const { uploadImages, getImages, deleteImage } = require('../controllers/imageController');
const { protect }  = require('../middleware/auth');
const upload       = require('../middleware/upload');

router.post('/',       protect, upload.array('images', 20), uploadImages);
router.get('/',        protect, getImages);
router.delete('/:id',  protect, deleteImage);

module.exports = router;
