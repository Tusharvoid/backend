-- Employee Leave Management System Database
-- Run this file in MySQL before starting the Node.js server.

CREATE DATABASE IF NOT EXISTS employee_leave_system;
USE employee_leave_system;

DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('employee', 'admin') NOT NULL,
  department VARCHAR(100) NOT NULL,
  leave_balance INT NOT NULL DEFAULT 12,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type ENUM('Sick Leave', 'Casual Leave', 'Annual Leave') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
  admin_comment VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample users
-- Plain passwords for testing:
-- admin@example.com    -> admin123
-- employee@example.com -> employee123
-- priya@example.com    -> employee123

INSERT INTO users (name, email, password, role, department, leave_balance) VALUES
('Admin User', 'admin@example.com', '$2b$10$4LHk7LbSCeL04I0DLCwA5uQkMjckg5GzTqdxOe6xoRO9t48EnTLWa', 'admin', 'HR', 0),
('Employee User', 'employee@example.com', '$2b$10$O7YJrKkp/w7/.1IDzzak9e9oNBhskFySDN0CA7JllmzF2K0JQ8yCG', 'employee', 'IT', 12),
('Priya Sharma', 'priya@example.com', '$2b$10$wpKl.p.1iwHAgU48ZCjJOOeFu/8I/J0GDbs3JfPBd14bRVm.tXXua', 'employee', 'Finance', 10);

-- Sample leave requests
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status, admin_comment) VALUES
(2, 'Sick Leave', '2026-06-10', '2026-06-11', 'Fever and doctor appointment', 'Pending', NULL),
(3, 'Casual Leave', '2026-06-15', '2026-06-15', 'Personal work', 'Pending', NULL);
