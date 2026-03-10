const path = require('path');

module.exports = {
    PORT: process.env.PORT || 5000,
    // MySQL / Sequelize
    DB_HOST:     process.env.DB_HOST     || 'localhost',
    DB_PORT:     parseInt(process.env.DB_PORT) || 3306,
    DB_NAME:     process.env.DB_NAME     || 'lawyer_management',
    DB_USER:     process.env.DB_USER     || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    JWT_EXPIRE: process.env.JWT_EXPIRE  || '30d',
    // Email
    EMAIL_SERVICE:  process.env.EMAIL_SERVICE  || 'your_email_service',
    EMAIL_USERNAME: process.env.EMAIL_USERNAME || process.env.EMAIL_USER || 'your_email@example.com',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || 'your_email_password',
    // Storage paths
    PDF_STORAGE_PATH: process.env.PDF_STORAGE_PATH || path.join(__dirname, '..', 'uploads', 'pdfs'),
    UPLOADS_PATH:     process.env.UPLOADS_PATH     || path.join(__dirname, '..', 'uploads'),
    SUMMARIES_PATH:   process.env.SUMMARIES_PATH   || path.join(__dirname, '..', 'uploads', 'summaries')
};
