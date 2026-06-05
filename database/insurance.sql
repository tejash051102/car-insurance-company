-- DriveSure
-- The application uses MongoDB through Mongoose models.
-- This SQL file is included as a relational reference for the requested project structure.

CREATE DATABASE IF NOT EXISTS car_insurance_management;
USE car_insurance_management;

CREATE TABLE users (
  id CHAR(24) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'agent', 'manager') DEFAULT 'agent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id CHAR(24) PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  date_of_birth DATE,
  street VARCHAR(160),
  city VARCHAR(80),
  state VARCHAR(80),
  zip_code VARCHAR(20),
  country VARCHAR(80) DEFAULT 'India',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_by CHAR(24),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE vehicles (
  id CHAR(24) PRIMARY KEY,
  customer_id CHAR(24) NOT NULL,
  registration_number VARCHAR(40) NOT NULL UNIQUE,
  make VARCHAR(80) NOT NULL,
  model VARCHAR(80) NOT NULL,
  year INT NOT NULL,
  vehicle_type ENUM('car', 'suv', 'truck', 'van', 'other') DEFAULT 'car',
  fuel_type ENUM('petrol', 'diesel', 'electric', 'hybrid', 'cng') DEFAULT 'petrol',
  chassis_number VARCHAR(80),
  engine_number VARCHAR(80),
  value DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE policies (
  id CHAR(24) PRIMARY KEY,
  policy_number VARCHAR(60) NOT NULL UNIQUE,
  customer_id CHAR(24) NOT NULL,
  vehicle_id CHAR(24) NOT NULL,
  type ENUM('comprehensive', 'third-party', 'collision', 'liability') NOT NULL,
  coverage_amount DECIMAL(12, 2) NOT NULL,
  premium_amount DECIMAL(12, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active', 'expired', 'cancelled', 'pending') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE claims (
  id CHAR(24) PRIMARY KEY,
  claim_number VARCHAR(60) NOT NULL UNIQUE,
  policy_id CHAR(24) NOT NULL,
  customer_id CHAR(24) NOT NULL,
  incident_date DATE NOT NULL,
  reported_date DATE NOT NULL,
  claim_amount DECIMAL(12, 2) NOT NULL,
  approved_amount DECIMAL(12, 2) DEFAULT 0,
  status ENUM('submitted', 'under-review', 'approved', 'rejected', 'settled') DEFAULT 'submitted',
  description TEXT NOT NULL,
  document_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (policy_id) REFERENCES policies(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE payments (
  id CHAR(24) PRIMARY KEY,
  payment_number VARCHAR(60) NOT NULL UNIQUE,
  policy_id CHAR(24) NOT NULL,
  customer_id CHAR(24) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  method ENUM('cash', 'card', 'upi', 'bank-transfer', 'cheque') DEFAULT 'upi',
  payment_date DATE NOT NULL,
  status ENUM('paid', 'pending', 'failed', 'refunded') DEFAULT 'pending',
  transaction_id VARCHAR(120),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (policy_id) REFERENCES policies(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
