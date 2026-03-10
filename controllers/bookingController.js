const { Op }     = require('sequelize');
const Booking    = require('../models/bookingModel');
const Lawyer     = require('../models/lawyerModel');
const User       = require('../models/userModel');
const Message    = require('../models/messageModel');
const Payment    = require('../models/paymentModel');
const sendEmail  = require('../utils/emailService');
const generatePDF = require('../utils/pdfGenerator');

const lawyerInclude = {
  model: Lawyer, as: 'lawyer',
  include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
};

// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const lawyer = await Lawyer.findByPk(req.body.lawyer || req.body.lawyerId);
    if (!lawyer) return res.status(404).json({ success: false, message: 'Lawyer not found' });

    const booking = await Booking.create({ ...req.body, userId: req.user.id, lawyerId: lawyer.id });

    const [clientUser, lawyerUser] = await Promise.all([
      User.findByPk(req.user.id, { attributes: ['name', 'email'] }),
      User.findByPk(lawyer.userId, { attributes: ['name', 'email'] })
    ]);
    sendEmail({ email: clientUser.email, subject: 'Booking Confirmation', message: `Your booking with ${lawyerUser.name} has been created and is pending approval.` }).catch(() => {});
    sendEmail({ email: lawyerUser.email, subject: 'New Booking Request',  message: `You have a new booking request from ${clientUser.name}.` }).catch(() => {});

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings  (admin)
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        lawyerInclude
      ]
    });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/user
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [lawyerInclude]
    });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/lawyer
exports.getLawyerBookings = async (req, res) => {
  try {
    const lawyer = await Lawyer.findOne({ where: { userId: req.user.id } });
    if (!lawyer) return res.status(404).json({ success: false, message: 'Lawyer profile not found' });

    const bookings = await Booking.findAll({
      where: { lawyerId: lawyer.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }]
    });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/:id
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: User,    as: 'user',     attributes: ['id', 'name', 'email', 'phone'] },
        lawyerInclude,
        { model: Message, as: 'messages' },
        { model: Payment, as: 'payment'  }
      ]
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const lawyer = await Lawyer.findOne({ where: { userId: req.user.id } });
    const isOwner  = booking.userId === req.user.id;
    const isLawyer = lawyer && lawyer.id === booking.lawyerId;
    const isAdmin  = req.user.role === 'admin';

    if (!isOwner && !isLawyer && !isAdmin) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this booking' });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const lawyer = await Lawyer.findOne({ where: { userId: req.user.id } });
    if ((!lawyer || lawyer.id !== booking.lawyerId) && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this booking' });
    }

    await booking.update({ status });

    const [clientUser, lawyerUser] = await Promise.all([
      User.findByPk(booking.userId,                        { attributes: ['name', 'email'] }),
      lawyer ? User.findByPk(lawyer.userId,                { attributes: ['name', 'email'] }) : null
    ]);
    if (clientUser) {
      sendEmail({ email: clientUser.email, subject: `Booking ${status}`, message: `Your booking has been ${status}.` }).catch(() => {});
    }
    if (status === 'completed' && clientUser && lawyerUser) {
      await generatePDF({ title: booking.title, clientName: clientUser.name, lawyerName: lawyerUser.name, date: booking.date, duration: booking.duration, fee: booking.fee, description: booking.description }).catch(() => {});
    }
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/bookings/:id  (admin)
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    await booking.destroy();
    res.status(200).json({ success: true, message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
