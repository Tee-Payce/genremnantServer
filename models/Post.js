const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Post = {
  create: (postData) => {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const { authorId, type, title, content, summary = null, status = 'pending' } = postData;
      db.run(
        `INSERT INTO posts (id, authorId, type, title, content, summary, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, authorId, type, title, content, summary, status],
        function (err) {
          if (err) reject(err);
          else resolve({ id, authorId, type, title, content, summary, status });
        }
      );
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT p.*, u.displayName as authorName FROM posts p 
         LEFT JOIN users u ON p.authorId = u.id WHERE p.id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  },

  findByAuthor: (authorId) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT p.*, u.displayName as authorName FROM posts p 
         LEFT JOIN users u ON p.authorId = u.id WHERE p.authorId = ? ORDER BY p.createdAt DESC`,
        [authorId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  getPublished: () => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT p.*, u.displayName as authorName FROM posts p 
         LEFT JOIN users u ON p.authorId = u.id 
         WHERE p.status = 'published' ORDER BY p.publishedAt DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  getPending: () => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT p.*, u.displayName as authorName FROM posts p 
         LEFT JOIN users u ON p.authorId = u.id 
         WHERE p.status = 'pending' ORDER BY p.createdAt DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  update: (id, updates) => {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(', ');
      const values = Object.values(updates);
      db.run(
        `UPDATE posts SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  approvePost: (id) => {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE posts SET status = ?, publishedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        ['published', id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  rejectPost: (id, feedback) => {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE posts SET status = ?, rejectionFeedback = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        ['rejected', feedback, id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM posts WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  search: (query) => {
    return new Promise((resolve, reject) => {
      const searchTerm = `%${query}%`;
      db.all(
        `SELECT p.*, u.displayName as authorName FROM posts p 
         LEFT JOIN users u ON p.authorId = u.id 
         WHERE (p.title LIKE ? OR p.content LIKE ?) AND p.status = 'published'
         ORDER BY p.publishedAt DESC`,
        [searchTerm, searchTerm],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },
};

module.exports = Post;