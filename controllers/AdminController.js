const User = require('../models/User');
const Post = require('../models/Post');
const { v4: uuidv4 } = require('uuid');

const AdminController = {
  // User Management
  getAllUsers: async (req, res) => {
    try {
      const users = await User.getAllUsers();
      // Ensure all profile fields are included
      const usersWithProfiles = users.map(user => ({
        ...user,
        whatsapp: user.whatsapp || null,
        instagram: user.instagram || null,
        tiktok: user.tiktok || null,
        facebook: user.facebook || null
      }));
      res.json({ success: true, users: usersWithProfiles });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  changeUserRole: async (req, res) => {
    try {
      const { userId, newRole } = req.body;

      if (!userId || !newRole) {
        return res.status(400).json({ message: 'User ID and new role are required' });
      }

      const validRoles = ['regular', 'contributor', 'admin'];
      if (!validRoles.includes(newRole)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      await User.changeRole(userId, newRole);
      res.json({ success: true, message: 'User role updated' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  suspendUser: async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      await User.suspendUser(userId);
      res.json({ success: true, message: 'User suspended' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateUserWhatsApp: async (req, res) => {
    try {
      const { userId, whatsapp } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      await User.update(userId, { whatsapp });
      res.json({ success: true, message: 'WhatsApp number updated' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  approveContributorRequest: async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      await User.changeRole(userId, 'contributor');
      await User.update(userId, { contributorRequestStatus: 'approved' });

      res.json({ success: true, message: 'Contributor request approved' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  rejectContributorRequest: async (req, res) => {
    try {
      const { userId, feedback } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      await User.update(userId, {
        contributorRequestStatus: 'rejected',
        rejectionFeedback: feedback,
      });

      res.json({ success: true, message: 'Contributor request rejected' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Post Management
  getPendingPosts: async (req, res) => {
    try {
      const posts = await Post.getPending();
      res.json({ success: true, posts });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  approvePost: async (req, res) => {
    try {
      const { postId } = req.body;

      if (!postId) {
        return res.status(400).json({ message: 'Post ID is required' });
      }

      await Post.approvePost(postId);
      res.json({ success: true, message: 'Post approved and published' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  rejectPost: async (req, res) => {
    try {
      const { postId, feedback } = req.body;

      if (!postId) {
        return res.status(400).json({ message: 'Post ID is required' });
      }

      await Post.rejectPost(postId, feedback);
      res.json({ success: true, message: 'Post rejected' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  editPost: async (req, res) => {
    try {
      const { postId, title, content, summary } = req.body;

      if (!postId) {
        return res.status(400).json({ message: 'Post ID is required' });
      }

      const updates = {};
      if (title) updates.title = title;
      if (content) updates.content = content;
      if (summary) updates.summary = summary;

      await Post.update(postId, updates);
      res.json({ success: true, message: 'Post updated' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deletePost: async (req, res) => {
    try {
      const { postId } = req.body;

      if (!postId) {
        return res.status(400).json({ message: 'Post ID is required' });
      }

      await Post.delete(postId);
      res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getStatistics: async (req, res) => {
    try {
      const users = await User.getAllUsers();
      const publishedPosts = await Post.getPublished();
      const pendingPosts = await Post.getPending();

      const stats = {
        totalUsers: users.length,
        regularUsers: users.filter((u) => u.role === 'regular').length,
        contributors: users.filter((u) => u.role === 'contributor').length,
        admins: users.filter((u) => u.role === 'admin').length,
        suspendedUsers: users.filter((u) => u.status === 'suspended').length,
        publishedPosts: publishedPosts.length,
        pendingPosts: pendingPosts.length,
      };

      res.json({ success: true, stats });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = AdminController;
