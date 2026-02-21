-- Database Migration for Settings Module

-- Add columns to users table
ALTER TABLE users 
ADD COLUMN currency VARCHAR(10) DEFAULT 'USD',
ADD COLUMN language VARCHAR(20) DEFAULT 'English',
ADD COLUMN notification_preferences JSON DEFAULT (JSON_OBJECT(
  'emailAlerts', true,
  'budgetReminders', true,
  'taxDeadlines', true,
  'weeklyReports', false
));

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT '#3b82f6',
  type ENUM('income', 'expense') DEFAULT 'expense',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed default categories for existing users
INSERT INTO categories (user_id, name, color, type)
SELECT id, 'Business Expenses', '#ef4444', 'expense' FROM users;

INSERT INTO categories (user_id, name, color, type)
SELECT id, 'Office Rent', '#3b82f6', 'expense' FROM users;

INSERT INTO categories (user_id, name, color, type)
SELECT id, 'Software Subscriptions', '#8b5cf6', 'expense' FROM users;

INSERT INTO categories (user_id, name, color, type)
SELECT id, 'Professional Development', '#22c55e', 'expense' FROM users;
