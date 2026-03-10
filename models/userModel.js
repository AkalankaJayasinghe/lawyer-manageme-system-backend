const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: {
    type: DataTypes.ENUM('user', 'lawyer', 'admin'),
    defaultValue: 'user'
  },
  phone:   { type: DataTypes.STRING(20),  allowNull: true },
  address: { type: DataTypes.TEXT,        allowNull: true },
  profileImage: {
    type: DataTypes.STRING(500),
    defaultValue: 'default-profile.jpg',
    field: 'profile_image'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  resetPasswordToken:  { type: DataTypes.STRING(500), allowNull: true, field: 'reset_password_token' },
  resetPasswordExpire: { type: DataTypes.DATE,        allowNull: true, field: 'reset_password_expire' }
}, {
  tableName:  'users',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  false
});

// Instance method: sign JWT
User.prototype.getSignedJwtToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Instance method: compare password
User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;

