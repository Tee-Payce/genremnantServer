const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

const AuthController = {
  register: async (req, res) => {
    try {
      const { email, displayName, password, confirmPassword, requestToContribute } = req.body;

      // Validation
      if (!email || !displayName || !password || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      // Check if user exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        email,
        displayName,
        passwordHash,
        role: 'regular',
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token: user.id,
        user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Account is suspended' });
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      res.json({
        success: true,
        message: 'Login successful',
        token: user.id,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          status: user.status,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getMe: async (req, res) => {
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
          status: user.status,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  logout: (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
  },
};

module.exports = AuthController;
