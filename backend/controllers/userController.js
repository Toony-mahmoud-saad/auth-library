const User = require('../models/User');

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};