const express = require('express');
const PostController = require('../controllers/PostController');
const { verifyToken, checkRole, checkUserStatus } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/published', PostController.getPublishedPosts);
router.get('/search', PostController.searchPosts);
router.get('/:id', PostController.getPostById);

// Protected routes
router.post('/', verifyToken, checkUserStatus, checkRole(['contributor', 'admin']), PostController.createPost);
router.get('/my-posts', verifyToken, PostController.getMyPosts);
router.put('/:id', verifyToken, checkUserStatus, checkRole(['contributor', 'admin']), PostController.updatePost);
router.delete('/:id', verifyToken, checkUserStatus, checkRole(['contributor', 'admin']), PostController.deletePost);

module.exports = router;
