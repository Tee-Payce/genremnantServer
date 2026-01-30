const Post = require('../models/Post');
const { v4: uuidv4 } = require('uuid');

const PostController = {
  createPost: async (req, res) => {
    try {
      const { type, title, content, summary } = req.body;

      if (!type || !title || !content) {
        return res.status(400).json({ message: 'Type, title, and content are required' });
      }

      if (!['sermon', 'daily_motivation'].includes(type)) {
        return res.status(400).json({ message: 'Invalid post type' });
      }

      const post = await Post.create({
        authorId: req.user.id,
        type,
        title,
        content,
        summary,
        status: 'pending',
      });

      res.status(201).json({
        success: true,
        message: 'Post created and awaiting approval',
        post,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getMyPosts: async (req, res) => {
    try {
      const posts = await Post.findByAuthor(req.user.id);
      res.json({ success: true, posts });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getPublishedPosts: async (req, res) => {
    try {
      const posts = await Post.getPublished();
      res.json({ success: true, posts });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getPostById: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.json({ success: true, post });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updatePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (post.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Cannot update this post' });
      }

      if (post.status !== 'pending') {
        return res.status(400).json({ message: 'Can only edit pending posts' });
      }

      await Post.update(req.params.id, req.body);
      res.json({ success: true, message: 'Post updated' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deletePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (post.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Cannot delete this post' });
      }

      await Post.delete(req.params.id);
      res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  searchPosts: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const posts = await Post.search(q);
      res.json({ success: true, posts });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = PostController;
