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

// Database persistence test endpoint
app.get('/test-db-persistence', async (req, res) => {
  const db = require('./config/database');
  const { v4: uuidv4 } = require('uuid');
  
  try {
    const testId = uuidv4();
    const testData = {
      id: testId,
      email: `test-${Date.now()}@example.com`,
      displayName: 'Test User',
      passwordHash: 'test-hash',
      role: 'regular',
      status: 'active'
    };

    // Insert test data
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (id, email, displayName, passwordHash, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
        [testData.id, testData.email, testData.displayName, testData.passwordHash, testData.role, testData.status],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Retrieve test data
    const retrievedData = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [testId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Clean up test data
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [testId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      success: true,
      message: 'Database persistence test passed',
      dbPath: process.env.NODE_ENV === 'production' ? '/app/data/database.db' : 'local database.db',
      testData: retrievedData,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      dbPath: process.env.NODE_ENV === 'production' ? '/app/data/database.db' : 'local database.db'
    });
  }
});

// Test all CRUD operations
app.get('/test-crud-operations', async (req, res) => {
  const db = require('./config/database');
  const { v4: uuidv4 } = require('uuid');
  const bcrypt = require('bcryptjs');
  
  const results = {
    create: false,
    read: false,
    update: false,
    delete: false,
    errors: []
  };

  try {
    const testId = uuidv4();
    const postId = uuidv4();
    const commentId = uuidv4();
    const reactionId = uuidv4();
    
    // Test CREATE operations
    try {
      // Create user
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (id, email, displayName, passwordHash, role) VALUES (?, ?, ?, ?, ?)`,
          [testId, `test-${Date.now()}@example.com`, 'Test User', 'hash', 'regular'],
          function(err) { if (err) reject(err); else resolve(); }
        );
      });
      
      // Create post
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO posts (id, authorId, type, title, content, status) VALUES (?, ?, ?, ?, ?, ?)`,
          [postId, testId, 'sermon', 'Test Post', 'Test content', 'published'],
          function(err) { if (err) reject(err); else resolve(); }
        );
      });
      
      // Create comment
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO comments (id, postId, userId, content) VALUES (?, ?, ?, ?)`,
          [commentId, postId, testId, 'Test comment'],
          function(err) { if (err) reject(err); else resolve(); }
        );
      });
      
      // Create reaction
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO reactions (id, postId, userId, reactionType) VALUES (?, ?, ?, ?)`,
          [reactionId, postId, testId, 'like'],
          function(err) { if (err) reject(err); else resolve(); }
        );
      });
      
      results.create = true;
    } catch (error) {
      results.errors.push(`CREATE: ${error.message}`);
    }

    // Test READ operations
    try {
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [testId], (err, row) => {
          if (err) reject(err); else resolve(row);
        });
      });
      
      const post = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM posts WHERE id = ?', [postId], (err, row) => {
          if (err) reject(err); else resolve(row);
        });
      });
      
      if (user && post) results.read = true;
    } catch (error) {
      results.errors.push(`READ: ${error.message}`);
    }

    // Test UPDATE operations
    try {
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE users SET displayName = ? WHERE id = ?`,
          ['Updated User', testId],
          function(err) { if (err) reject(err); else resolve(); }
        );
      });
      
      results.update = true;
    } catch (error) {
      results.errors.push(`UPDATE: ${error.message}`);
    }

    // Test DELETE operations
    try {
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM reactions WHERE id = ?', [reactionId], function(err) {
          if (err) reject(err); else resolve();
        });
      });
      
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM comments WHERE id = ?', [commentId], function(err) {
          if (err) reject(err); else resolve();
        });
      });
      
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM posts WHERE id = ?', [postId], function(err) {
          if (err) reject(err); else resolve();
        });
      });
      
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM users WHERE id = ?', [testId], function(err) {
          if (err) reject(err); else resolve();
        });
      });
      
      results.delete = true;
    } catch (error) {
      results.errors.push(`DELETE: ${error.message}`);
    }

    const allPassed = results.create && results.read && results.update && results.delete;
    
    res.json({
      success: allPassed,
      message: allPassed ? 'All CRUD operations passed' : 'Some operations failed',
      results,
      environment: process.env.NODE_ENV || 'development',
      dbPath: process.env.NODE_ENV === 'production' ? '/app/data/database.db' : 'local database.db'
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      results
    });
  }
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
