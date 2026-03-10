/**
 * models/index.js
 * Load all Sequelize models and define associations.
 * Require this file ONCE in server.js before connecting to the DB.
 */

const User     = require('./userModel');
const Lawyer   = require('./lawyerModel');
const Booking  = require('./bookingModel');
const Payment  = require('./paymentModel');
const Message  = require('./messageModel');
const Document = require('./documentModel');

// ── User ↔ Lawyer (1-to-1) ──────────────────────────────────────────────────
User.hasOne(Lawyer,   { foreignKey: 'userId', as: 'lawyerProfile' });
Lawyer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── User / Lawyer ↔ Booking (1-to-many) ─────────────────────────────────────
User.hasMany(Booking,   { foreignKey: 'userId',   as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId',   as: 'user' });

Lawyer.hasMany(Booking,   { foreignKey: 'lawyerId', as: 'bookings' });
Booking.belongsTo(Lawyer, { foreignKey: 'lawyerId', as: 'lawyer' });

// ── Booking ↔ Payment (1-to-1) ───────────────────────────────────────────────
Booking.hasOne(Payment,   { foreignKey: 'bookingId', as: 'payment' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

User.hasMany(Payment,   { foreignKey: 'userId',   as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId',   as: 'user' });

Lawyer.hasMany(Payment,   { foreignKey: 'lawyerId', as: 'payments' });
Payment.belongsTo(Lawyer, { foreignKey: 'lawyerId', as: 'lawyer' });

// ── Booking ↔ Message (1-to-many) ────────────────────────────────────────────
Booking.hasMany(Message,   { foreignKey: 'bookingId', as: 'messages' });
Message.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// sender / receiver
User.hasMany(Message, { foreignKey: 'senderId',   as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId',   as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// ── User / Booking ↔ Document (1-to-many) ────────────────────────────────────
User.hasMany(Document,   { foreignKey: 'uploadedBy', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

Booking.hasMany(Document,   { foreignKey: 'bookingId', as: 'uploadedDocuments' });
Document.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

module.exports = { User, Lawyer, Booking, Payment, Message, Document };
