const express = require('express');
const AdminController = require('../controllers/AdminController');
const { verifyToken, checkRole, checkUserStatus } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(verifyToken, checkUserStatus, checkRole(['admin']));

// User Management
router.get('/users', AdminController.getAllUsers);
router.post('/users/change-role', AdminController.changeUserRole);
router.post('/users/suspend', AdminController.suspendUser);
router.post('/users/update-whatsapp', AdminController.updateUserWhatsApp);
router.post('/users/approve-contributor', AdminController.approveContributorRequest);
router.post('/users/reject-contributor', AdminController.rejectContributorRequest);

// Post Management
router.get('/posts/pending', AdminController.getPendingPosts);
router.post('/posts/approve', AdminController.approvePost);
router.post('/posts/reject', AdminController.rejectPost);
router.put('/posts/edit', AdminController.editPost);
router.delete('/posts/delete', AdminController.deletePost);

// Statistics
router.get('/statistics', AdminController.getStatistics);

module.exports = router;
