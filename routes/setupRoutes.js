const express = require('express');
const { createAdmin } = require('../controllers/SetupController');

const router = express.Router();

router.post('/create-admin', createAdmin);

module.exports = router;