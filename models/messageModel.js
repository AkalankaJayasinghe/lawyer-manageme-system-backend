const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Message = sequelize.define('Message', {
  id:         { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  bookingId:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: true,  field: 'booking_id' },
  senderId:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'sender_id' },
  receiverId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'receiver_id' },
  content:    { type: DataTypes.TEXT,    allowNull: false },
  timestamp:  { type: DataTypes.DATE,   defaultValue: DataTypes.NOW },
  isRead:     { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_read' }
}, {
  tableName:  'messages',
  timestamps: false
});

module.exports = Message;
