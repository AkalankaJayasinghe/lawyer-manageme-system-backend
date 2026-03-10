const Document = require('../models/documentModel');

// POST /api/documents/upload
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { title, booking } = req.body;
    const document = await Document.create({
      title,
      filePath:   req.file.path,
      fileType:   req.file.mimetype,
      size:       req.file.size,
      uploadedBy: req.user.id,
      bookingId:  booking || null
    });
    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
};

// GET /api/documents
exports.getAllDocuments = async (req, res) => {
  try {
    const where = { uploadedBy: req.user.id };
    if (req.query.booking) where.bookingId = req.query.booking;
    const documents = await Document.findAll({ where });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving documents', error: error.message });
  }
};

// GET /api/documents/:id
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving document', error: error.message });
  }
};

// DELETE /api/documents/:id
exports.deleteDocument = async (req, res) => {
  try {
    const deleted = await Document.destroy({ where: { id: req.params.id, uploadedBy: req.user.id } });
    if (!deleted) return res.status(404).json({ message: 'Document not found or not authorized' });
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
};
