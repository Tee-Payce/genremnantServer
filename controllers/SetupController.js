const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

const createAdmin = async (req, res) => {
  try {
    const adminEmail = 'teepayce11@gmail.com';
    const adminPassword = '123pass#';
    const adminDisplayName = 'Admin User';

    // Hash the password
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const userId = uuidv4();

    // Insert admin user
    db.run(
      `INSERT INTO users (id, email, displayName, passwordHash, role, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, adminEmail, adminDisplayName, passwordHash, 'admin', 'active'],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.json({ message: 'Admin user already exists' });
          }
          return res.status(500).json({ error: err.message });
        }

        res.json({
          success: true,
          message: 'Admin user created successfully',
          email: adminEmail,
          userId: userId
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createAdmin };