const express = require('express');

const router = express.Router();

function requireEmployee(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Please login first' });
  }

  if (req.session.user.role !== 'employee') {
    return res.status(403).json({ message: 'Employees only' });
  }

  next();
}

router.use(requireEmployee);

router.get('/profile', async (req, res) => {
  try {
    const [users] = await req.app.locals.db.query(
      'SELECT id, name, email, role, department, leave_balance FROM users WHERE id = ?',
      [req.session.user.id]
    );

    res.json({ user: users[0] });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load profile', error: error.message });
  }
});

router.get('/balance', async (req, res) => {
  try {
    const [users] = await req.app.locals.db.query(
      'SELECT leave_balance FROM users WHERE id = ?',
      [req.session.user.id]
    );

    res.json({ leaveBalance: users[0].leave_balance });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load leave balance', error: error.message });
  }
});

router.post('/apply-leave', async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    await req.app.locals.db.query(
      `INSERT INTO leave_requests
       (employee_id, leave_type, start_date, end_date, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [req.session.user.id, leaveType, startDate, endDate, reason]
    );

    res.status(201).json({ message: 'Leave request submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to apply for leave', error: error.message });
  }
});

router.get('/leave-history', async (req, res) => {
  try {
    const [requests] = await req.app.locals.db.query(
      `SELECT id, leave_type, start_date, end_date, reason, status, admin_comment, created_at
       FROM leave_requests
       WHERE employee_id = ?
       ORDER BY created_at DESC`,
      [req.session.user.id]
    );

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load leave history', error: error.message });
  }
});

module.exports = router;
