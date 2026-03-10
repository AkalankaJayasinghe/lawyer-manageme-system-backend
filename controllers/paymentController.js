const Payment = require('../models/paymentModel');

// POST /api/payments/create-payment
exports.createPayment = async (req, res) => {
  try {
    const payment = await Payment.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, message: 'Payment created successfully', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/payments/payments
exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({ where: { userId: req.user.id } });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/payments/payments/:id
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/payments/payment-history
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { userId: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
