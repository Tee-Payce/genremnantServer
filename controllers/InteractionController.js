const Comment = require('../models/Comment');
const Reaction = require('../models/Reaction');

const InteractionController = {
  addComment: async (req, res) => {
    try {
      const { postId, content } = req.body;

      if (!postId || !content) {
        return res.status(400).json({ message: 'Post ID and content are required' });
      }

      const comment = await Comment.create({
        postId,
        userId: req.user.id,
        content,
      });

      res.status(201).json({
        success: true,
        message: 'Comment added',
        comment,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getComments: async (req, res) => {
    try {
      const comments = await Comment.findByPost(req.params.postId);
      res.json({ success: true, comments });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteComment: async (req, res) => {
    try {
      await Comment.delete(req.params.id);
      res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  searchComments: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const comments = await Comment.search(q);
      res.json({ success: true, comments });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  addReaction: async (req, res) => {
    try {
      const { postId, reactionType } = req.body;

      if (!postId || !reactionType) {
        return res.status(400).json({ message: 'Post ID and reaction type are required' });
      }

      const validReactions = ['like', 'heart', 'amen', 'inspire'];
      if (!validReactions.includes(reactionType)) {
        return res.status(400).json({ message: 'Invalid reaction type' });
      }

      await Reaction.addReaction(postId, req.user.id, reactionType);
      res.status(201).json({ success: true, message: 'Reaction added' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  removeReaction: async (req, res) => {
    try {
      const { postId, reactionType } = req.body;

      if (!postId || !reactionType) {
        return res.status(400).json({ message: 'Post ID and reaction type are required' });
      }

      await Reaction.removeReaction(postId, req.user.id, reactionType);
      res.json({ success: true, message: 'Reaction removed' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getPostReactions: async (req, res) => {
    try {
      const reactions = await Reaction.getReactionsByPost(req.params.postId);
      res.json({ success: true, reactions });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getUserReactions: async (req, res) => {
    try {
      const reactions = await Reaction.getUserReaction(req.params.postId, req.user.id);
      res.json({ success: true, reactions });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = InteractionController;
