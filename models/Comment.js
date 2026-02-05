const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Comment = {
  create: (commentData) => {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const { postId, userId, content } = commentData;
      db.run(
        `INSERT INTO comments (id, postId, userId, content) VALUES (?, ?, ?, ?)`,
        [id, postId, userId, content],
        function (err) {
          if (err) reject(err);
          else resolve({ id, postId, userId, content });
        }
      );
    });
  },

  findByPost: (postId) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT c.*, u.displayName as userName FROM comments c 
         LEFT JOIN users u ON c.userId = u.id 
         WHERE c.postId = ? ORDER BY c.createdAt ASC`,
        [postId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM comments WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  search: (query) => {
    return new Promise((resolve, reject) => {
      const searchTerm = `%${query}%`;
      db.all(
        `SELECT c.*, u.displayName as userName, p.title as postTitle FROM comments c 
         LEFT JOIN users u ON c.userId = u.id 
         LEFT JOIN posts p ON c.postId = p.id 
         WHERE c.content LIKE ? AND p.status = 'published'
         ORDER BY c.createdAt DESC`,
        [searchTerm],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },
};

module.exports = Comment;