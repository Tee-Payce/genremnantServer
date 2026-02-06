const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        displayName TEXT NOT NULL,
        passwordHash TEXT NOT NULL,
        role TEXT DEFAULT 'regular' CHECK(role IN ('regular', 'contributor', 'admin')),
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'inactive')),
        contributorRequestStatus TEXT DEFAULT NULL CHECK(contributorRequestStatus IN ('pending', 'approved', 'rejected')),
        rejectionFeedback TEXT,
        whatsapp TEXT,
        instagram TEXT,
        tiktok TEXT,
        facebook TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        authorId TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('sermon', 'daily_motivation')),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'published')),
        rejectionFeedback TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        publishedAt TIMESTAMP,
        FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        postId TEXT NOT NULL,
        userId TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS reactions (
        id TEXT PRIMARY KEY,
        postId TEXT NOT NULL,
        userId TEXT NOT NULL,
        reactionType TEXT NOT NULL CHECK(reactionType IN ('like', 'heart', 'amen', 'inspire')),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(postId, userId, reactionType),
        FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id TEXT PRIMARY KEY,
        requester_id TEXT NOT NULL,
        addressee_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS contributor_requests (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL UNIQUE,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
        requestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewedAt TIMESTAMP,
        reviewedBy TEXT,
        feedback TEXT,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewedBy) REFERENCES users(id)
      )
    `);

    console.log('PostgreSQL database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    client.release();
  }
};

initializeDatabase();

module.exports = pool;
