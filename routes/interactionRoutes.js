const express = require('express');
const InteractionController = require('../controllers/InteractionController');
const { verifyToken, checkUserStatus } = require('../middleware/auth');

const router = express.Router();

// Comments
router.get('/comments/:postId', InteractionController.getComments);
router.post('/comments', verifyToken, checkUserStatus, InteractionController.addComment);
router.delete('/comments/:id', verifyToken, InteractionController.deleteComment);
router.get('/search-comments', InteractionController.searchComments);

// Reactions
router.get('/reactions/:postId', InteractionController.getPostReactions);
router.get('/my-reactions/:postId', verifyToken, InteractionController.getUserReactions);
router.post('/reactions', verifyToken, checkUserStatus, InteractionController.addReaction);
router.delete('/reactions', verifyToken, checkUserStatus, InteractionController.removeReaction);

module.exports = router;
