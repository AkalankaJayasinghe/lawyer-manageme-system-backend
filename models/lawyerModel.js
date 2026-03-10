const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Arrays stored as JSON columns for compatibility with existing controller logic
const Lawyer = sequelize.define('Lawyer', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    unique: true,
    field: 'user_id'
  },
  licenseNumber: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'license_number'
  },
  specializations: { type: DataTypes.JSON, defaultValue: [] },
  experience:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  bio:              { type: DataTypes.TEXT, allowNull: false },
  education:        { type: DataTypes.JSON, defaultValue: [] },
  rates:            { type: DataTypes.JSON, defaultValue: {} },
  availability:     { type: DataTypes.JSON, defaultValue: [] },
  availableTimeSlots: {
    type: DataTypes.JSON,
    defaultValue: [],
    field: 'available_time_slots'
  },
  languages: { type: DataTypes.JSON, defaultValue: [] },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    validate: { min: 0, max: 5 }
  },
  reviews: { type: DataTypes.JSON, defaultValue: [] }
}, {
  tableName:  'lawyers',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  false
});

module.exports = Lawyer;
