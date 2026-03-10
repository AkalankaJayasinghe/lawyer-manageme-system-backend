const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/userModel');
const Lawyer = require('../models/lawyerModel');
const sendEmail = require('../utils/emailService');

// Helper – build token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
};

// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, licenseNumber, specializations, bio, experience, rates } = req.body;

    if (await User.findOne({ where: { email } })) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role: role || 'user' });

    if (role === 'lawyer') {
      if (!licenseNumber || !bio || !experience) {
        await user.destroy();
        return res.status(400).json({ success: false, message: 'Please provide all required lawyer information' });
      }
      await Lawyer.create({
        userId: user.id,
        licenseNumber,
        specializations: specializations || [],
        bio,
        experience,
        rates: rates || {}
      });
    }

    sendEmail({ email: user.email, subject: 'Welcome to LegalConnect', message: `Dear ${user.name}, thank you for registering.` }).catch(() => {});
    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ where: { email } }); // includes password
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/auth/logout
exports.logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out' });
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'lawyer') {
      const lawyerProfile = await Lawyer.findOne({ where: { userId: user.id } });
      return res.status(200).json({ success: true, data: { user, lawyerProfile: lawyerProfile || {} } });
    }
    return res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/auth/updatedetails
exports.updateDetails = async (req, res) => {
  try {
    const fields = {};
    ['name', 'email', 'phone', 'address'].forEach(f => { if (req.body[f] !== undefined) fields[f] = req.body[f]; });

    await User.update(fields, { where: { id: req.user.id } });
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/auth/updatepassword
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const user = await User.findByPk(req.user.id); // includes password
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
