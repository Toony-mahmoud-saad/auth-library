const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

// Generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '3m' }
  );
  
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_SECRET,
    { expiresIn: '5m' }
  );
  
  return { accessToken, refreshToken };
};

// Register user
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    user = new User({ username, email, password, role: role || 'user' });
    await user.save();
    
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Save refresh token
    await new RefreshToken({
      token: refreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 7 * 24 * 60 * 60 * 1000
    }).save();
    
    res.status(201).json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Save refresh token
    await new RefreshToken({
      token: refreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }).save();
    
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }
    
    // Verify token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    
    // Check if token exists in DB
    const storedToken = await RefreshToken.findOne({ 
      token: refreshToken,
      user: decoded.id,
    });
    
    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
    
    // Generate new access token
    const user = await User.findById(decoded.id);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    
    // Update refresh token in DB
    storedToken.token = newRefreshToken;
    storedToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await storedToken.save();
    
    res.json({ accessToken: accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'No refresh token provided' });
    }
    
    await RefreshToken.findOneAndDelete({ token: refreshToken });
    
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};