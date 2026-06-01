const express = require('express');

const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Please login first' });
  }

  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }

  next();
}

function countLeaveDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const oneDay = 1000 * 60 * 60 * 24;

  // Inclusive count: 10 June to 12 June means 3 leave days.
  return Math.floor((end - start) / oneDay) + 1;
}

router.use(requireAdmin);

router.get('/requests', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `SELECT lr.*, u.name AS employee_name, u.email, u.department, u.leave_balance
               FROM leave_requests lr
               JOIN users u ON lr.employee_id = u.id`;
    const params = [];

    if (status && status !== 'All') {
      sql += ' WHERE lr.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY lr.created_at DESC';

    const [requests] = await req.app.locals.db.query(sql, params);
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load leave requests', error: error.message });
  }
});

router.get('/employees', async (req, res) => {
  try {
    const [employees] = await req.app.locals.db.query(
      "SELECT id, name, email, role, department, leave_balance FROM users WHERE role = 'employee'"
    );

    res.json({ employees });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load employees', error: error.message });
  }
});

router.post('/approve/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    const comment = req.body.comment || 'Approved';

    const [leaveRequests] = await req.app.locals.db.query('SELECT * FROM leave_requests WHERE id = ?', [
      requestId
    ]);
    const leaveRequest = leaveRequests[0];

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending requests can be approved' });
    }

    const days = countLeaveDays(leaveRequest.start_date, leaveRequest.end_date);
    const [users] = await req.app.locals.db.query('SELECT * FROM users WHERE id = ?', [
      leaveRequest.employee_id
    ]);
    const employee = users[0];

    if (employee.leave_balance < days) {
      return res.status(400).json({ message: 'Employee does not have enough leave balance' });
    }

    await req.app.locals.db.query('UPDATE users SET leave_balance = leave_balance - ? WHERE id = ?', [
      days,
      leaveRequest.employee_id
    ]);

    await req.app.locals.db.query(
      "UPDATE leave_requests SET status = 'Approved', admin_comment = ? WHERE id = ?",
      [comment, requestId]
    );

    res.json({ message: 'Leave request approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to approve leave request', error: error.message });
  }
});

router.post('/reject/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    const comment = req.body.comment || 'Rejected';

    const [leaveRequests] = await req.app.locals.db.query('SELECT * FROM leave_requests WHERE id = ?', [
      requestId
    ]);
    const leaveRequest = leaveRequests[0];

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending requests can be rejected' });
    }

    await req.app.locals.db.query(
      "UPDATE leave_requests SET status = 'Rejected', admin_comment = ? WHERE id = ?",
      [comment, requestId]
    );

    res.json({ message: 'Leave request rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to reject leave request', error: error.message });
  }
});

module.exports = router;
