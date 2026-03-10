const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  bookingId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true,  field: 'booking_id' },
  userId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'user_id' },
  lawyerId:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'lawyer_id' },
  amount:    { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  paymentMethod: {
    type: DataTypes.ENUM('credit_card', 'paypal', 'bank_transfer'),
    allowNull: false,
    field: 'payment_method'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  }
}, {
  tableName:  'payments',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  'updated_at'
});

module.exports = Payment;
