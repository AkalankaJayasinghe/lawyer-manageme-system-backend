const express = require('express');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateUserProfile);
router.delete('/profile', protect, userController.deleteUserAccount);
router.get('/all', protect, authorize('admin'), userController.getAllUsers);
router.put('/:id/activate', protect, authorize('admin'), userController.activateUser);
router.put('/:id/deactivate', protect, authorize('admin'), userController.deactivateUser);
router.delete('/:id', protect, authorize('admin'), userController.deleteUserById);

module.exports = router;