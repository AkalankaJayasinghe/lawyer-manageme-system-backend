-- =============================================================
-- Lawyer Management System - SQL Database Schema
-- Mapped from MongoDB/Mongoose models
-- Compatible with: PostgreSQL 14+
-- =============================================================

-- Create the database (run as superuser outside a transaction block):
-- CREATE DATABASE lawyer_management;
-- \c lawyer_management

-- =============================================================
-- ENUMS
-- =============================================================
CREATE TYPE user_role        AS ENUM ('user', 'lawyer', 'admin');
CREATE TYPE day_of_week      AS ENUM ('Monday','Tuesday','Wednesday',
                                      'Thursday','Friday','Saturday','Sunday');
CREATE TYPE urgency_level    AS ENUM ('low', 'medium', 'high');
CREATE TYPE booking_status   AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_status   AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE payment_method   AS ENUM ('credit_card', 'paypal', 'bank_transfer');
CREATE TYPE payment_txn_status AS ENUM ('pending', 'completed', 'failed');

-- =============================================================
-- TABLE: users
-- =============================================================
CREATE TABLE users (
    id                    SERIAL PRIMARY KEY,
    name                  VARCHAR(255) NOT NULL,
    email                 VARCHAR(255) NOT NULL UNIQUE,
    password              VARCHAR(255) NOT NULL,
    role                  user_role    NOT NULL DEFAULT 'user',
    phone                 VARCHAR(20),
    address               TEXT,
    profile_image         VARCHAR(500) DEFAULT 'default-profile.jpg',
    is_active             BOOLEAN      NOT NULL DEFAULT TRUE,
    reset_password_token  VARCHAR(500),
    reset_password_expire TIMESTAMPTZ,
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role  ON users (role);

-- =============================================================
-- TABLE: lawyers
-- =============================================================
CREATE TABLE lawyers (
    id                INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id           INT          NOT NULL UNIQUE
                        REFERENCES users (id) ON DELETE CASCADE,
    license_number    VARCHAR(100) NOT NULL UNIQUE,
    experience        INT          NOT NULL,
    bio               TEXT         NOT NULL,
    hourly_rate       NUMERIC(10,2),
    consultation_rate NUMERIC(10,2),
    rating            NUMERIC(3,2) NOT NULL DEFAULT 0.00
                        CHECK (rating >= 0 AND rating <= 5),
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lawyers_user_id ON lawyers (user_id);

-- =============================================================
-- TABLE: lawyer_specializations
-- =============================================================
CREATE TABLE lawyer_specializations (
    id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lawyer_id      INT         NOT NULL REFERENCES lawyers (id) ON DELETE CASCADE,
    specialization VARCHAR(100) NOT NULL
);

CREATE INDEX idx_spec_lawyer_id ON lawyer_specializations (lawyer_id);

-- =============================================================
-- TABLE: lawyer_education
-- =============================================================
CREATE TABLE lawyer_education (
    id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lawyer_id   INT         NOT NULL REFERENCES lawyers (id) ON DELETE CASCADE,
    institution VARCHAR(255),
    degree      VARCHAR(255),
    year        SMALLINT
);

CREATE INDEX idx_edu_lawyer_id ON lawyer_education (lawyer_id);

-- =============================================================
-- TABLE: lawyer_availability
-- =============================================================
CREATE TABLE lawyer_availability (
    id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lawyer_id INT        NOT NULL REFERENCES lawyers (id) ON DELETE CASCADE,
    day       day_of_week NOT NULL,
    UNIQUE (lawyer_id, day)
);

-- =============================================================
-- TABLE: lawyer_time_slots
-- =============================================================
CREATE TABLE lawyer_time_slots (
    id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lawyer_id  INT         NOT NULL REFERENCES lawyers (id) ON DELETE CASCADE,
    day        VARCHAR(20) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time   VARCHAR(10) NOT NULL
);

CREATE INDEX idx_slots_lawyer_id ON lawyer_time_slots (lawyer_id);

-- =============================================================
-- TABLE: lawyer_languages
-- =============================================================
CREATE TABLE lawyer_languages (
    id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lawyer_id INT         NOT NULL REFERENCES lawyers (id) ON DELETE CASCADE,
    language  VARCHAR(100) NOT NULL
);

-- =============================================================
-- TABLE: bookings
-- =============================================================
CREATE TABLE bookings (
    id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id        INT           NOT NULL REFERENCES users   (id) ON DELETE CASCADE,
    lawyer_id      INT           NOT NULL REFERENCES lawyers (id) ON DELETE CASCADE,
    title          VARCHAR(255)  NOT NULL,
    description    TEXT          NOT NULL,
    date           DATE          NOT NULL,
    start_time     VARCHAR(20)   NOT NULL,
    duration       INT           NOT NULL DEFAULT 60 CHECK (duration > 0),
    fee            NUMERIC(10,2) NOT NULL,
    urgency_level  urgency_level  NOT NULL DEFAULT 'medium',
    status         booking_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    notes          TEXT,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_user_id   ON bookings (user_id);
CREATE INDEX idx_bookings_lawyer_id ON bookings (lawyer_id);
CREATE INDEX idx_bookings_status    ON bookings (status);
CREATE INDEX idx_bookings_date      ON bookings (date);

-- =============================================================
-- TABLE: booking_documents
-- =============================================================
CREATE TABLE booking_documents (
    id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id  INT           NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
    filename    VARCHAR(500)  NOT NULL,
    filepath    VARCHAR(1000) NOT NULL,
    upload_date TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookdoc_booking_id ON booking_documents (booking_id);

-- =============================================================
-- TABLE: payments
-- =============================================================
CREATE TABLE payments (
    id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id     INT                 REFERENCES bookings (id) ON DELETE SET NULL,
    user_id        INT           NOT NULL REFERENCES users   (id) ON DELETE CASCADE,
    lawyer_id      INT           NOT NULL REFERENCES lawyers (id) ON DELETE CASCADE,
    amount         NUMERIC(10,2) NOT NULL,
    payment_method payment_method NOT NULL,
    status         payment_txn_status NOT NULL DEFAULT 'pending',
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id    ON payments (user_id);
CREATE INDEX idx_payments_booking_id ON payments (booking_id);
CREATE INDEX idx_payments_status     ON payments (status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- =============================================================
-- TABLE: messages
-- =============================================================
CREATE TABLE messages (
    id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id  INT         REFERENCES bookings (id) ON DELETE SET NULL,
    sender_id   INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    receiver_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    content     TEXT        NOT NULL,
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_read     BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_messages_booking_id  ON messages (booking_id);
CREATE INDEX idx_messages_sender_id   ON messages (sender_id);
CREATE INDEX idx_messages_receiver_id ON messages (receiver_id);
CREATE INDEX idx_messages_timestamp   ON messages (timestamp);

-- =============================================================
-- TABLE: documents
-- =============================================================
CREATE TABLE documents (
    id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title       VARCHAR(255)  NOT NULL,
    file_path   VARCHAR(1000) NOT NULL,
    file_type   VARCHAR(100)  NOT NULL,
    size        INT,
    uploaded_by INT NOT NULL  REFERENCES users    (id) ON DELETE CASCADE,
    booking_id  INT           REFERENCES bookings (id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_uploaded_by ON documents (uploaded_by);
CREATE INDEX idx_documents_booking_id  ON documents (booking_id);

-- =============================================================
-- TABLE: lawyer_reviews
-- =============================================================
CREATE TABLE lawyer_reviews (
    id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lawyer_id  INT           NOT NULL REFERENCES lawyers (id) ON DELETE CASCADE,
    user_id    INT           NOT NULL REFERENCES users   (id) ON DELETE CASCADE,
    text       TEXT,
    rating     NUMERIC(3,2)  NOT NULL CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_lawyer_id ON lawyer_reviews (lawyer_id);

-- =============================================================
-- TRIGGER: Keep lawyers.rating in sync automatically
-- =============================================================
CREATE OR REPLACE FUNCTION fn_sync_lawyer_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_lawyer_id INT;
BEGIN
    v_lawyer_id := COALESCE(NEW.lawyer_id, OLD.lawyer_id);
    UPDATE lawyers
    SET rating = COALESCE(
        (SELECT AVG(rating) FROM lawyer_reviews WHERE lawyer_id = v_lawyer_id),
        0.00
    )
    WHERE id = v_lawyer_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_lawyer_rating
AFTER INSERT OR UPDATE OR DELETE ON lawyer_reviews
FOR EACH ROW EXECUTE FUNCTION fn_sync_lawyer_rating();

-- =============================================================
-- INSERT INTO users
-- =============================================================
INSERT INTO users (name, email, password, role)
VALUES (
  'Admin User',
  'admin@test.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin'
);
