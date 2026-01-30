const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const User = {
  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  create: (userData) => {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const { email, displayName, passwordHash, role = 'regular' } = userData;
      db.run(
        `INSERT INTO users (id, email, displayName, passwordHash, role) VALUES (?, ?, ?, ?, ?)`,
        [id, email, displayName, passwordHash, role],
        function (err) {
          if (err) reject(err);
          else resolve({ id, email, displayName, role });
        }
      );
    });
  },

  updateProfile: (id, profileData) => {
    return new Promise((resolve, reject) => {
      const { displayName, whatsapp, instagram, tiktok, facebook } = profileData;
      db.run(
        `UPDATE users SET displayName = ?, whatsapp = ?, instagram = ?, tiktok = ?, facebook = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [displayName, whatsapp, instagram, tiktok, facebook, id],
        function (err) {
          if (err) reject(err);
          else resolve();
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
        `UPDATE users SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, email, displayName, role, status, whatsapp, instagram, tiktok, facebook, createdAt FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  suspendUser: (id) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET status = ? WHERE id = ?', ['suspended', id], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  changeRole: (id, newRole) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET role = ? WHERE id = ?', [newRole, id], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },
};

module.exports = User;
