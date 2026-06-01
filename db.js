const mysql = require('mysql2/promise');
require('dotenv').config();

// This file keeps all database connection details in one place.
// Change the values in .env when your MySQL username/password is different.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'employee_leave_system',
  waitForConnections: true,
  connectionLimit: 10
});

// This function checks whether Node.js can connect to MySQL.
// It runs once when the server starts and prints a helpful message.
async function testConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('MySQL connected successfully');
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
  }
}

module.exports = pool;
module.exports.testConnection = testConnection;
