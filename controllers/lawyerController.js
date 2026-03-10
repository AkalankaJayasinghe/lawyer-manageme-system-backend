const Lawyer = require('../models/lawyerModel');
const User   = require('../models/userModel');

// GET /api/lawyers/lawyers
exports.getLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });
    res.status(200).json(lawyers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/lawyers/lawyers/:id
exports.getLawyerById = async (req, res) => {
  try {
    const lawyer = await Lawyer.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });
    if (!lawyer) return res.status(404).json({ message: 'Lawyer not found' });
    res.status(200).json(lawyer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/lawyers/specializations
exports.getSpecializations = async (req, res) => {
  try {
    const lawyers = await Lawyer.findAll({ attributes: ['specializations'] });
    const all = lawyers.flatMap(l => (Array.isArray(l.specializations) ? l.specializations : []));
    const unique = [...new Set(all)].filter(Boolean);
    res.status(200).json(unique);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/lawyers/profile
exports.createLawyerProfile = async (req, res) => {
  try {
    const existing = await Lawyer.findOne({ where: { userId: req.user.id } });
    if (existing) return res.status(400).json({ message: 'Lawyer profile already exists' });

    const lawyer = await Lawyer.create({ userId: req.user.id, ...req.body });
    await User.update({ role: 'lawyer' }, { where: { id: req.user.id } });
    res.status(201).json(lawyer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/lawyers/profile/:id
exports.updateLawyerProfile = async (req, res) => {
  try {
    const lawyer = await Lawyer.findOne({ where: { userId: req.user.id } });
    if (!lawyer) return res.status(404).json({ message: 'Lawyer profile not found' });
    await lawyer.update(req.body);
    res.status(200).json(lawyer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/lawyers/profile/:id
exports.deleteLawyerProfile = async (req, res) => {
  try {
    const lawyer = await Lawyer.findOne({ where: { userId: req.user.id } });
    if (!lawyer) return res.status(404).json({ message: 'Lawyer profile not found' });
    await lawyer.destroy();
    await User.update({ role: 'user' }, { where: { id: req.user.id } });
    res.status(200).json({ message: 'Lawyer profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/lawyers/profile/:id/approve  (admin)
exports.approveLawyer = async (req, res) => {
  try {
    const [updated] = await Lawyer.update({ is_verified: true, status: 'active' }, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ message: 'Lawyer not found' });
    res.status(200).json({ success: true, message: 'Lawyer approved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/lawyers/profile/:id/reject  (admin)
exports.rejectLawyer = async (req, res) => {
  try {
    const [updated] = await Lawyer.update({ is_verified: false, status: 'inactive' }, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ message: 'Lawyer not found' });
    res.status(200).json({ success: true, message: 'Lawyer rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/lawyers/profile/:id/suspend  (admin)
exports.suspendLawyer = async (req, res) => {
  try {
    const [updated] = await Lawyer.update({ status: 'suspended' }, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ message: 'Lawyer not found' });
    res.status(200).json({ success: true, message: 'Lawyer suspended' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/lawyers/profile/:id  (admin)
exports.deleteLawyerById = async (req, res) => {
  try {
    const lawyer = await Lawyer.findByPk(req.params.id);
    if (!lawyer) return res.status(404).json({ message: 'Lawyer not found' });
    await User.update({ role: 'user' }, { where: { id: lawyer.userId } });
    await lawyer.destroy();
    res.status(200).json({ success: true, message: 'Lawyer deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

