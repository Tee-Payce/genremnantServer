const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or open database
const db = new sqlite3.Database(path.resolve(__dirname, '../../genremnant.db'), (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

const initializeDatabase = () => {
  db.serialize(() => {
    // Users table with roles
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        displayName TEXT NOT NULL,
        passwordHash TEXT NOT NULL,
        role TEXT DEFAULT 'regular' CHECK(role IN ('regular', 'contributor', 'admin')),
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'inactive')),
        contributorRequestStatus TEXT DEFAULT NULL CHECK(contributorRequestStatus IN ('pending', 'approved', 'rejected')),
        rejectionFeedback TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Posts table
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        authorId TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('sermon', 'daily_motivation')),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'published')),
        rejectionFeedback TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        publishedAt DATETIME,
        FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Comments table
    db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        postId TEXT NOT NULL,
        userId TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Reactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS reactions (
        id TEXT PRIMARY KEY,
        postId TEXT NOT NULL,
        userId TEXT NOT NULL,
        reactionType TEXT NOT NULL CHECK(reactionType IN ('like', 'heart', 'amen', 'inspire')),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(postId, userId, reactionType),
        FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Contributor requests table (for auditing)
    db.run(`
      CREATE TABLE IF NOT EXISTS contributor_requests (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL UNIQUE,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
        requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewedAt DATETIME,
        reviewedBy TEXT,
        feedback TEXT,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewedBy) REFERENCES users(id)
      )
    `);

    console.log('Database tables initialized');
  });
};

module.exports = db;
