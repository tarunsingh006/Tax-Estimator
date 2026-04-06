-- TaxPal Full Database Schema
-- Last updated: 2026-02-23
 
SET FOREIGN_KEY_CHECKS = 0;
 
-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    income_bracket VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'USD',
    language VARCHAR(20) DEFAULT 'English',
    notification_preferences JSON DEFAULT (JSON_OBJECT(
      'emailAlerts', true,
      'budgetReminders', true,
      'taxDeadlines', true,
      'weeklyReports', false
    )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#3b82f6',
    type ENUM('income', 'expense') DEFAULT 'expense',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
 
-- 3. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    category VARCHAR(255),
    amount DECIMAL(15, 2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
 
-- 4. Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
 
-- 5. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    report_type VARCHAR(255) NOT NULL,
    period VARCHAR(100) NOT NULL,
    format VARCHAR(50) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
 
-- 6. Tax Estimates Table
CREATE TABLE IF NOT EXISTS tax_estimates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    country VARCHAR(100),
    state VARCHAR(100),
    filing_status VARCHAR(50),
    quarter VARCHAR(50),
    gross_income DECIMAL(15, 2),
    business_expenses DECIMAL(15, 2),
    retirement_contributions DECIMAL(15, 2),
    health_insurance DECIMAL(15, 2),
    home_office DECIMAL(15, 2),
    estimated_tax DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
 
-- 7. Tax Calendar Events Table
CREATE TABLE IF NOT EXISTS tax_calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    event_type ENUM('reminder', 'payment') DEFAULT 'reminder',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
 
-- 8. Password Resets Table
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reset_token VARCHAR(255) NOT NULL,
    reset_session_token VARCHAR(255),
    verified TINYINT(1) DEFAULT 0,
    used TINYINT(1) DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
 
SET FOREIGN_KEY_CHECKS = 1;
 
-- Default Categories Seed
-- Note: This will only work if users exist.
-- In a real migration, this might be handled by a script.
-- INSERT INTO categories (user_id, name, color, type)
-- SELECT id, 'Business Expenses', '#ef4444', 'expense' FROM users;
-- INSERT INTO categories (user_id, name, color, type)
-- SELECT id, 'Office Rent', '#3b82f6', 'expense' FROM users;
-- INSERT INTO categories (user_id, name, color, type)
-- SELECT id, 'Software Subscriptions', '#8b5cf6', 'expense' FROM users;
-- INSERT INTO categories (user_id, name, color, type)
-- SELECT id, 'Professional Development', '#22c55e', 'expense' FROM users;
 
 