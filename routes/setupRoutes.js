const express = require('express');
const { createAdmin } = require('../controllers/SetupController');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Setup routes working' });
});

router.post('/create-admin', createAdmin);

module.exports = router;