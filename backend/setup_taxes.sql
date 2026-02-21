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

CREATE TABLE IF NOT EXISTS tax_calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    event_type ENUM('reminder', 'payment') DEFAULT 'reminder',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


