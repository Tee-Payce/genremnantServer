const express = require('express');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const dbPath = path.join(__dirname, '../../genremnant.db');

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        whatsapp: user.whatsapp,
        instagram: user.instagram,
        tiktok: user.tiktok,
        facebook: user.facebook
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { displayName, whatsapp, instagram, tiktok, facebook } = req.body;
    const userId = req.user.id;

    await User.updateProfile(userId, {
      displayName,
      whatsapp,
      instagram,
      tiktok,
      facebook
    });

    const updatedUser = await User.findById(userId);
    
    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Update individual social media fields
router.put('/profile/whatsapp', verifyToken, async (req, res) => {
  try {
    const { whatsapp } = req.body;
    const userId = req.user.id;

    await User.update(userId, { whatsapp });
    const updatedUser = await User.findById(userId);
    
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update WhatsApp' });
  }
});

router.put('/profile/instagram', verifyToken, async (req, res) => {
  try {
    const { instagram } = req.body;
    const userId = req.user.id;

    await User.update(userId, { instagram });
    const updatedUser = await User.findById(userId);
    
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update Instagram' });
  }
});

router.put('/profile/tiktok', verifyToken, async (req, res) => {
  try {
    const { tiktok } = req.body;
    const userId = req.user.id;

    await User.update(userId, { tiktok });
    const updatedUser = await User.findById(userId);
    
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update TikTok' });
  }
});

router.put('/profile/facebook', verifyToken, async (req, res) => {
  try {
    const { facebook } = req.body;
    const userId = req.user.id;

    await User.update(userId, { facebook });
    const updatedUser = await User.findById(userId);
    
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update Facebook' });
  }
});

// Discover users
router.get('/discover', verifyToken, async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load users' });
  }
});

// Get friends
router.get('/friends', verifyToken, async (req, res) => {
  try {
    const db = new sqlite3.Database(dbPath);
    const userId = req.user.id;
    
    // Get accepted friends
    db.all(`
      SELECT u.id, u.email, u.displayName, u.role, u.whatsapp, u.instagram, u.tiktok, u.facebook
      FROM users u
      INNER JOIN friendships f ON (
        (f.requester_id = ? AND f.addressee_id = u.id) OR
        (f.addressee_id = ? AND f.requester_id = u.id)
      )
      WHERE f.status = 'accepted'
    `, [userId, userId], (err, friends) => {
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
      `, [userId], (err, requests) => {
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
        `, [userId], (err, sentRequests) => {
          if (err) {
            console.error('Error fetching sent requests:', err);
            return res.status(500).json({ error: 'Failed to fetch sent requests' });
          }
          
          res.json({ 
            success: true,
            friends, 
            requests, 
            sentRequests 
          });
          db.close();
        });
      });
    });
  } catch (error) {
    console.error('Friends fetch error:', error);
    res.status(500).json({ message: 'Failed to load friends' });
  }
});

// Send friend request
router.post('/friend-request', verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const requesterId = req.user.id;
    
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
        
        res.json({ success: true, message: 'Friend request sent successfully' });
        db.close();
      });
    });
  } catch (error) {
    console.error('Friend request error:', error);
    res.status(500).json({ message: 'Failed to send friend request' });
  }
});

// Accept friend request
router.post('/friend-request/accept', verifyToken, async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user.id;
    
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
      
      res.json({ success: true, message: 'Friend request accepted successfully' });
      db.close();
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Failed to accept friend request' });
  }
});

module.exports = router;