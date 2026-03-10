const express = require('express');
const lawyerController = require('../controllers/lawyerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public GET routes
router.get('/lawyers', lawyerController.getLawyers);
router.get('/lawyers/:id', lawyerController.getLawyerById);
router.get('/specializations', lawyerController.getSpecializations);

// Protected Lawyer profile routes
router.post('/profile', protect, lawyerController.createLawyerProfile);
router.put('/profile/:id', protect, lawyerController.updateLawyerProfile);
router.delete('/profile/:id', protect, lawyerController.deleteLawyerProfile);

// Admin management routes
router.put('/profile/:id/approve', protect, authorize('admin'), lawyerController.approveLawyer);
router.put('/profile/:id/reject', protect, authorize('admin'), lawyerController.rejectLawyer);
router.put('/profile/:id/suspend', protect, authorize('admin'), lawyerController.suspendLawyer);
router.delete('/profile/:id/admin', protect, authorize('admin'), lawyerController.deleteLawyerById);

module.exports = router;