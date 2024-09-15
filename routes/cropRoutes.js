const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route to list all crops
router.get('/crops', authMiddleware, cropController.getCrops);

// Route to add a new crop
router.get('/crops/add', authMiddleware, (req, res) => res.render('crops/add'));
router.post('/crops/add', authMiddleware, cropController.addCrop);

// Route to edit a crop
router.get('/crops/edit/:id', authMiddleware, cropController.getEditCrop);
router.post('/crops/edit/:id', authMiddleware, cropController.updateCrop);

// Route to delete a crop
router.post('/crops/delete/:id', authMiddleware, cropController.deleteCrop);

module.exports = router;
