-- MySQL database schema for AI-Powered Personal Farming Assistant

CREATE DATABASE IF NOT EXISTS farmer_assistant;
USE farmer_assistant;

-- 1. Farmers Profile Table
CREATE TABLE IF NOT EXISTS farmers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    village VARCHAR(100) NOT NULL,
    mandal VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    latitude DECIMAL(9, 6) NULL,
    longitude DECIMAL(9, 6) NULL,
    land_size_acres DECIMAL(5, 2) NOT NULL,
    soil_type VARCHAR(50) NOT NULL,
    water_source VARCHAR(50) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(100) NULL,
    otp_expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (mobile_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Crops Table
CREATE TABLE IF NOT EXISTS crops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    sowing_date DATE NOT NULL,
    crop_stage VARCHAR(50) NOT NULL DEFAULT 'Sowing', -- e.g., Sowing, Vegetative, Flowering, Harvesting
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE,
    INDEX (farmer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Disease Detection History Table
CREATE TABLE IF NOT EXISTS disease_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    crop_id INT NULL,
    image_url VARCHAR(255) NOT NULL, -- Path to uploaded image file
    detected_disease VARCHAR(150) NOT NULL,
    confidence DECIMAL(5, 2) NOT NULL, -- Percentage confidence
    treatment_recommendation TEXT NOT NULL,
    verified_by_expert BOOLEAN DEFAULT FALSE,
    expert_comments TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL,
    INDEX (farmer_id),
    INDEX (crop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Market Prices Table
CREATE TABLE IF NOT EXISTS market_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL,
    mandi_name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- price per quintal / standard unit
    price_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (crop_name, price_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Government Schemes Table
CREATE TABLE IF NOT EXISTS government_schemes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    eligibility_criteria TEXT NOT NULL,
    benefits TEXT NOT NULL,
    scheme_type VARCHAR(50) NOT NULL DEFAULT 'State', -- State (Telangana) / Central
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- Weather, Market, Disease, Reminder, Scheme
    message TEXT NOT NULL,
    sent_via VARCHAR(20) NOT NULL DEFAULT 'WhatsApp', -- WhatsApp, Web
    status VARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending, Sent, Failed
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE,
    INDEX (farmer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. User Activity Log Table
CREATE TABLE IF NOT EXISTS user_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NULL, -- Can be NULL for unauthenticated/anonymous queries (e.g. WhatsApp initial query)
    action VARCHAR(100) NOT NULL, -- e.g., Register, Query Chatbot, Upload Image, Fetch Price
    channel VARCHAR(20) NOT NULL, -- WhatsApp / Web
    request_data TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE SET NULL,
    INDEX (farmer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
