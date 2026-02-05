const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Reaction = {
  addReaction: (postId, userId, reactionType) => {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      db.run(
        `INSERT OR IGNORE INTO reactions (id, postId, userId, reactionType) VALUES (?, ?, ?, ?)`,
        [id, postId, userId, reactionType],
        function (err) {
          if (err) reject(err);
          else resolve({ id, postId, userId, reactionType });
        }
      );
    });
  },

  removeReaction: (postId, userId, reactionType) => {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM reactions WHERE postId = ? AND userId = ? AND reactionType = ?`,
        [postId, userId, reactionType],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  getReactionsByPost: (postId) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT reactionType, COUNT(*) as count FROM reactions WHERE postId = ? GROUP BY reactionType`,
        [postId],
        (err, rows) => {
          if (err) reject(err);
          else {
            const result = {};
            rows.forEach((row) => {
              result[row.reactionType] = row.count;
            });
            resolve(result);
          }
        }
      );
    });
  },

  getUserReaction: (postId, userId) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT reactionType FROM reactions WHERE postId = ? AND userId = ?`,
        [postId, userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map((r) => r.reactionType));
        }
      );
    });
  },
};

module.exports = Reaction;