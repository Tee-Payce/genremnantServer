require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PORT, CORS_ORIGIN } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const setupRoutes = require('./routes/setupRoutes');

const app = express();

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/setup', setupRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Debug endpoint to check users
app.get('/debug-users', (req, res) => {
  const db = require('./config/database');
  db.all('SELECT id, email, displayName, role, status FROM users', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ users: rows, count: rows.length });
  });
});

// Debug endpoint to check friendships table
app.get('/debug-friendships', (req, res) => {
  const db = require('./config/database');
  db.all('SELECT * FROM friendships', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message, message: 'Friendships table may not exist' });
    }
    res.json({ friendships: rows, count: rows.length });
  });
});

// One-time admin creation endpoint
app.post('/create-admin-now', async (req, res) => {
  const bcrypt = require('bcryptjs');
  const { v4: uuidv4 } = require('uuid');
  const db = require('./config/database');
  
  try {
    const adminEmail = 'teepayce11@gmail.com';
    const adminPassword = '123pass#';
    const adminDisplayName = 'Admin User';
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const userId = uuidv4();

    db.run(
      `INSERT INTO users (id, email, displayName, passwordHash, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, adminEmail, adminDisplayName, passwordHash, 'admin', 'active'],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.json({ message: 'Admin user already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: 'Admin created', email: adminEmail, userId });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = server;
