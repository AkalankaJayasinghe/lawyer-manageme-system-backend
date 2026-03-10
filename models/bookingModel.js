const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'user_id' },
  lawyerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'lawyer_id' },
  title:       { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT,        allowNull: false },
  date:        { type: DataTypes.DATEONLY,    allowNull: false },
  startTime:   { type: DataTypes.STRING(20),  allowNull: false, field: 'start_time' },
  duration:    { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 60 },
  fee:         { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  urgencyLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
    field: 'urgency_level'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending',
    field: 'payment_status'
  },
  documents: { type: DataTypes.JSON, defaultValue: [] },
  notes:     { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName:  'bookings',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  false
});

module.exports = Booking;
