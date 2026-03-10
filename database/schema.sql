-- =============================================================
-- Lawyer Management System - SQL Database Schema
-- Mapped from MongoDB/Mongoose models
-- Compatible with: MySQL 8.0+ / MariaDB 10.5+
-- =============================================================

CREATE DATABASE IF NOT EXISTS lawyer_management
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE lawyer_management;

-- =============================================================
-- TABLE: users
-- Source: models/userModel.js
-- =============================================================
CREATE TABLE users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(255)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password      VARCHAR(255)  NOT NULL,              -- bcrypt hash
    role          ENUM('user', 'lawyer', 'admin') NOT NULL DEFAULT 'user',
    phone         VARCHAR(20),
    address       TEXT,
    profile_image VARCHAR(500)  DEFAULT 'default-profile.jpg',
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    reset_password_token  VARCHAR(500),
    reset_password_expire DATETIME,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email  ON users (email);
CREATE INDEX idx_users_role   ON users (role);

-- =============================================================
-- TABLE: lawyers
-- Source: models/lawyerModel.js (core fields)
-- =============================================================
CREATE TABLE lawyers (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id          INT UNSIGNED NOT NULL UNIQUE,
    license_number   VARCHAR(100) NOT NULL UNIQUE,
    experience       INT UNSIGNED NOT NULL,              -- years
    bio              TEXT         NOT NULL,
    hourly_rate      DECIMAL(10,2),                      -- rates.hourly
    consultation_rate DECIMAL(10,2),                     -- rates.consultation
    rating           DECIMAL(3,2) NOT NULL DEFAULT 0.00, -- 0.00 – 5.00
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lawyers_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_lawyers_user_id ON lawyers (user_id);

-- =============================================================
-- TABLE: lawyer_specializations
-- Source: lawyerModel.js → specializations: [String]
-- =============================================================
CREATE TABLE lawyer_specializations (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lawyer_id       INT UNSIGNED NOT NULL,
    specialization  VARCHAR(100) NOT NULL,

    CONSTRAINT fk_spec_lawyer
        FOREIGN KEY (lawyer_id) REFERENCES lawyers (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_spec_lawyer_id ON lawyer_specializations (lawyer_id);

-- =============================================================
-- TABLE: lawyer_education
-- Source: lawyerModel.js → education: [{institution, degree, year}]
-- =============================================================
CREATE TABLE lawyer_education (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lawyer_id   INT UNSIGNED NOT NULL,
    institution VARCHAR(255),
    degree      VARCHAR(255),
    year        SMALLINT UNSIGNED,

    CONSTRAINT fk_edu_lawyer
        FOREIGN KEY (lawyer_id) REFERENCES lawyers (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_edu_lawyer_id ON lawyer_education (lawyer_id);

-- =============================================================
-- TABLE: lawyer_availability
-- Source: lawyerModel.js → availability: [String] (days of week)
-- =============================================================
CREATE TABLE lawyer_availability (
    id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lawyer_id INT UNSIGNED NOT NULL,
    day       ENUM('Monday','Tuesday','Wednesday','Thursday',
                   'Friday','Saturday','Sunday') NOT NULL,

    CONSTRAINT fk_avail_lawyer
        FOREIGN KEY (lawyer_id) REFERENCES lawyers (id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_avail (lawyer_id, day)
);

-- =============================================================
-- TABLE: lawyer_time_slots
-- Source: lawyerModel.js → availableTimeSlots: [{day, startTime, endTime}]
-- =============================================================
CREATE TABLE lawyer_time_slots (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lawyer_id  INT UNSIGNED NOT NULL,
    day        VARCHAR(20)  NOT NULL,
    start_time VARCHAR(10)  NOT NULL,   -- e.g. "09:00"
    end_time   VARCHAR(10)  NOT NULL,   -- e.g. "17:00"

    CONSTRAINT fk_slots_lawyer
        FOREIGN KEY (lawyer_id) REFERENCES lawyers (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_slots_lawyer_id ON lawyer_time_slots (lawyer_id);

-- =============================================================
-- TABLE: lawyer_languages
-- Source: lawyerModel.js → languages: [String]
-- =============================================================
CREATE TABLE lawyer_languages (
    id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lawyer_id INT UNSIGNED NOT NULL,
    language  VARCHAR(100) NOT NULL,

    CONSTRAINT fk_lang_lawyer
        FOREIGN KEY (lawyer_id) REFERENCES lawyers (id)
        ON DELETE CASCADE
);

-- =============================================================
-- TABLE: bookings
-- Source: models/bookingModel.js
-- =============================================================
CREATE TABLE bookings (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id        INT UNSIGNED NOT NULL,
    lawyer_id      INT UNSIGNED NOT NULL,
    title          VARCHAR(255) NOT NULL,
    description    TEXT         NOT NULL,
    date           DATE         NOT NULL,
    start_time     VARCHAR(20)  NOT NULL,               -- e.g. "10:00"
    duration       INT UNSIGNED NOT NULL DEFAULT 60,   -- minutes
    fee            DECIMAL(10,2) NOT NULL,
    urgency_level  ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
    status         ENUM('pending','confirmed','completed','cancelled')
                   NOT NULL DEFAULT 'pending',
    payment_status ENUM('pending','paid','refunded')
                   NOT NULL DEFAULT 'pending',
    notes          TEXT,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_user
        FOREIGN KEY (user_id)   REFERENCES users   (id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_lawyer
        FOREIGN KEY (lawyer_id) REFERENCES lawyers (id) ON DELETE CASCADE
);

CREATE INDEX idx_bookings_user_id   ON bookings (user_id);
CREATE INDEX idx_bookings_lawyer_id ON bookings (lawyer_id);
CREATE INDEX idx_bookings_status    ON bookings (status);
CREATE INDEX idx_bookings_date      ON bookings (date);

-- =============================================================
-- TABLE: booking_documents
-- Source: bookingModel.js → documents: [{filename, filepath, uploadDate}]
-- =============================================================
CREATE TABLE booking_documents (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id  INT UNSIGNED NOT NULL,
    filename    VARCHAR(500) NOT NULL,
    filepath    VARCHAR(1000) NOT NULL,
    upload_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bookdoc_booking
        FOREIGN KEY (booking_id) REFERENCES bookings (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_bookdoc_booking_id ON booking_documents (booking_id);

-- =============================================================
-- TABLE: payments
-- Source: models/paymentModel.js
-- =============================================================
CREATE TABLE payments (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id     INT UNSIGNED,                           -- nullable
    user_id        INT UNSIGNED NOT NULL,
    lawyer_id      INT UNSIGNED NOT NULL,
    amount         DECIMAL(10,2) NOT NULL,
    payment_method ENUM('credit_card','paypal','bank_transfer') NOT NULL,
    status         ENUM('pending','completed','failed') NOT NULL DEFAULT 'pending',
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                   ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_booking
        FOREIGN KEY (booking_id) REFERENCES bookings (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_payment_user
        FOREIGN KEY (user_id)   REFERENCES users   (id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_lawyer
        FOREIGN KEY (lawyer_id) REFERENCES lawyers (id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_user_id    ON payments (user_id);
CREATE INDEX idx_payments_booking_id ON payments (booking_id);
CREATE INDEX idx_payments_status     ON payments (status);

-- =============================================================
-- TABLE: messages
-- Source: models/messageModel.js
-- =============================================================
CREATE TABLE messages (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id  INT UNSIGNED,                           -- nullable
    sender_id   INT UNSIGNED NOT NULL,
    receiver_id INT UNSIGNED NOT NULL,
    content     TEXT NOT NULL,
    timestamp   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read     BOOLEAN  NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_msg_booking
        FOREIGN KEY (booking_id)  REFERENCES bookings (id) ON DELETE SET NULL,
    CONSTRAINT fk_msg_sender
        FOREIGN KEY (sender_id)   REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_receiver
        FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_booking_id  ON messages (booking_id);
CREATE INDEX idx_messages_sender_id   ON messages (sender_id);
CREATE INDEX idx_messages_receiver_id ON messages (receiver_id);
CREATE INDEX idx_messages_timestamp   ON messages (timestamp);

-- =============================================================
-- TABLE: documents
-- Source: models/documentModel.js
-- =============================================================
CREATE TABLE documents (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    file_path   VARCHAR(1000) NOT NULL,
    file_type   VARCHAR(100) NOT NULL,    -- e.g. 'application/pdf', 'image/jpeg'
    size        INT UNSIGNED,             -- bytes
    uploaded_by INT UNSIGNED NOT NULL,
    booking_id  INT UNSIGNED,             -- nullable
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_doc_uploader
        FOREIGN KEY (uploaded_by) REFERENCES users    (id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_booking
        FOREIGN KEY (booking_id)  REFERENCES bookings (id) ON DELETE SET NULL
);

CREATE INDEX idx_documents_uploaded_by ON documents (uploaded_by);
CREATE INDEX idx_documents_booking_id  ON documents (booking_id);

-- =============================================================
-- TABLE: lawyer_reviews
-- Source: lawyerModel.js → reviews: [{user, text, rating, date}]
-- =============================================================
CREATE TABLE lawyer_reviews (
    id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lawyer_id INT UNSIGNED NOT NULL,
    user_id   INT UNSIGNED NOT NULL,
    text      TEXT,
    rating    DECIMAL(3,2) NOT NULL,   -- 0.00 – 5.00
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_lawyer
        FOREIGN KEY (lawyer_id) REFERENCES lawyers (id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user
        FOREIGN KEY (user_id)   REFERENCES users   (id) ON DELETE CASCADE
);

CREATE INDEX idx_reviews_lawyer_id ON lawyer_reviews (lawyer_id);

-- =============================================================
-- TRIGGER: Keep lawyers.rating in sync when a review is added/updated/deleted
-- =============================================================
DELIMITER $$

CREATE TRIGGER trg_review_after_insert
AFTER INSERT ON lawyer_reviews
FOR EACH ROW
BEGIN
    UPDATE lawyers
    SET rating = (SELECT AVG(rating) FROM lawyer_reviews WHERE lawyer_id = NEW.lawyer_id)
    WHERE id = NEW.lawyer_id;
END$$

CREATE TRIGGER trg_review_after_update
AFTER UPDATE ON lawyer_reviews
FOR EACH ROW
BEGIN
    UPDATE lawyers
    SET rating = (SELECT AVG(rating) FROM lawyer_reviews WHERE lawyer_id = NEW.lawyer_id)
    WHERE id = NEW.lawyer_id;
END$$

CREATE TRIGGER trg_review_after_delete
AFTER DELETE ON lawyer_reviews
FOR EACH ROW
BEGIN
    UPDATE lawyers
    SET rating = IFNULL(
        (SELECT AVG(rating) FROM lawyer_reviews WHERE lawyer_id = OLD.lawyer_id),
        0.00
    )
    WHERE id = OLD.lawyer_id;
END$$

DELIMITER ;
