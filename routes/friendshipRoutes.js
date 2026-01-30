const express = require('express');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const router = express.Router();

const dbPath = path.join(__dirname, '../database.db');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // For now, just extract user ID from token (in production, verify JWT properly)
  req.userId = token;
  next();
};

// GET /api/users/discover - Get all users for discovery
router.get('/discover', verifyToken, (req, res) => {
  const db = new sqlite3.Database(dbPath);
  
  db.all(`
    SELECT id, email, displayName, role, whatsapp, instagram, tiktok, facebook
    FROM users 
    WHERE id != ?
  `, [req.userId], (err, users) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    
    res.json({ users });
  });
  
  db.close();
});

// GET /api/users/friends - Get friends and friend requests
router.get('/friends', verifyToken, (req, res) => {
  const db = new sqlite3.Database(dbPath);
  
  // Get accepted friends
  db.all(`
    SELECT u.id, u.email, u.displayName, u.role, u.whatsapp, u.instagram, u.tiktok, u.facebook
    FROM users u
    INNER JOIN friendships f ON (
      (f.requester_id = ? AND f.addressee_id = u.id) OR
      (f.addressee_id = ? AND f.requester_id = u.id)
    )
    WHERE f.status = 'accepted'
  `, [req.userId, req.userId], (err, friends) => {
    if (err) {
      console.error('Error fetching friends:', err);
      return res.status(500).json({ error: 'Failed to fetch friends' });
    }
    
    // Get incoming friend requests
    db.all(`
      SELECT u.id, u.email, u.displayName, u.role
      FROM users u
      INNER JOIN friendships f ON f.requester_id = u.id
      WHERE f.addressee_id = ? AND f.status = 'pending'
    `, [req.userId], (err, requests) => {
      if (err) {
        console.error('Error fetching friend requests:', err);
        return res.status(500).json({ error: 'Failed to fetch friend requests' });
      }
      
      // Get sent requests
      db.all(`
        SELECT u.id, u.email, u.displayName, u.role
        FROM users u
        INNER JOIN friendships f ON f.addressee_id = u.id
        WHERE f.requester_id = ? AND f.status = 'pending'
      `, [req.userId], (err, sentRequests) => {
        if (err) {
          console.error('Error fetching sent requests:', err);
          return res.status(500).json({ error: 'Failed to fetch sent requests' });
        }
        
        res.json({ 
          friends, 
          requests, 
          sentRequests 
        });
      });
    });
  });
  
  db.close();
});

// POST /api/users/friend-request - Send friend request
router.post('/friend-request', verifyToken, (req, res) => {
  const { userId } = req.body;
  const requesterId = req.userId;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  if (userId === requesterId) {
    return res.status(400).json({ error: 'Cannot send friend request to yourself' });
  }
  
  const db = new sqlite3.Database(dbPath);
  const friendshipId = uuidv4();
  
  // Check if friendship already exists
  db.get(`
    SELECT * FROM friendships 
    WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)
  `, [requesterId, userId, userId, requesterId], (err, existing) => {
    if (err) {
      console.error('Error checking existing friendship:', err);
      return res.status(500).json({ error: 'Failed to check existing friendship' });
    }
    
    if (existing) {
      return res.status(400).json({ error: 'Friendship already exists' });
    }
    
    // Create new friend request
    db.run(`
      INSERT INTO friendships (id, requester_id, addressee_id, status)
      VALUES (?, ?, ?, 'pending')
    `, [friendshipId, requesterId, userId], (err) => {
      if (err) {
        console.error('Error creating friend request:', err);
        return res.status(500).json({ error: 'Failed to send friend request' });
      }
      
      res.json({ message: 'Friend request sent successfully' });
    });
  });
  
  db.close();
});

// POST /api/users/friend-request/accept - Accept friend request
router.post('/friend-request/accept', verifyToken, (req, res) => {
  const { requestId } = req.body;
  const userId = req.userId;
  
  if (!requestId) {
    return res.status(400).json({ error: 'Request ID is required' });
  }
  
  const db = new sqlite3.Database(dbPath);
  
  // Update friendship status to accepted
  db.run(`
    UPDATE friendships 
    SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
    WHERE requester_id = ? AND addressee_id = ? AND status = 'pending'
  `, [requestId, userId], function(err) {
    if (err) {
      console.error('Error accepting friend request:', err);
      return res.status(500).json({ error: 'Failed to accept friend request' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    res.json({ message: 'Friend request accepted successfully' });
  });
  
  db.close();
});

module.exports = router;