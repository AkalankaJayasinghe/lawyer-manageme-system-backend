const { Op }    = require('sequelize');
const Message   = require('../models/messageModel');

// POST /api/messages/send
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, bookingId } = req.body;
    const message = await Message.create({ senderId: req.user.id, receiverId, content, bookingId: bookingId || null });
    res.status(201).json({ message: 'Message sent successfully', newMessage: message });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// GET /api/messages/:userId  – conversation between two users
exports.getMessages = async (req, res) => {
  try {
    const other = parseInt(req.params.userId);
    const me    = req.user.id;
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: me,    receiverId: other },
          { senderId: other, receiverId: me    }
        ]
      },
      order: [['timestamp', 'ASC']]
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving messages', error: error.message });
  }
};

// DELETE /api/messages/:messageId
exports.deleteMessage = async (req, res) => {
  try {
    const deleted = await Message.destroy({ where: { id: req.params.messageId } });
    if (!deleted) return res.status(404).json({ message: 'Message not found' });
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
};
