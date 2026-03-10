const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Document = sequelize.define('Document', {
  id:       { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  title:    { type: DataTypes.STRING(255),  allowNull: false },
  filePath: { type: DataTypes.STRING(1000), allowNull: false, field: 'file_path' },
  fileType: { type: DataTypes.STRING(100),  allowNull: false, field: 'file_type' },
  size:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  uploadedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'uploaded_by' },
  bookingId:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: true,  field: 'booking_id' }
}, {
  tableName:  'documents',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  false
});

module.exports = Document;
