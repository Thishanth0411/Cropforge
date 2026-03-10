const express = require('express');
const router  = express.Router();
const { cropImage, bulkCrop, getCropHistory, downloadCrop, deleteCrop } = require('../controllers/cropController');
const { protect } = require('../middleware/auth');

router.post('/',              protect, cropImage);
router.post('/bulk',          protect, bulkCrop);
router.get('/',               protect, getCropHistory);
router.get('/download/:id',   protect, downloadCrop);
router.delete('/:id',         protect, deleteCrop);

module.exports = router;
