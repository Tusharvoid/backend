// Helper function used by all pages to call backend APIs.
async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

function showMessage(text, type = 'success') {
  const message = document.getElementById('message');

  if (message) {
    message.textContent = text;
    message.className = `message ${type}`;
  }
}

function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString();
}

function statusBadge(status) {
  return `<span class="status ${status.toLowerCase()}">${status}</span>`;
}

async function requireRole(role) {
  try {
    const data = await apiRequest('/auth/me');

    if (data.user.role !== role) {
      window.location.href = '/login.html';
      return null;
    }

    return data.user;
  } catch (error) {
    window.location.href = '/login.html';
    return null;
  }
}

function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');

  if (!logoutBtn) {
    return;
  }

  logoutBtn.addEventListener('click', async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
  });
}

function setupLoginPage() {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (data.user.role === 'admin') {
        window.location.href = '/admin-dashboard.html';
      } else {
        window.location.href = '/employee-dashboard.html';
      }
    } catch (error) {
      showMessage(error.message, 'error');
    }
  });
}

async function loadEmployeeDashboard() {
  const user = await requireRole('employee');

  if (!user) {
    return;
  }

  document.getElementById('employeeName').textContent = user.name;

  const balanceData = await apiRequest('/employee/balance');
  document.getElementById('leaveBalance').textContent = balanceData.leaveBalance;

  const historyData = await apiRequest('/employee/leave-history');
  const body = document.getElementById('recentRequestsBody');
  const recentRequests = historyData.requests.slice(0, 5);

  body.innerHTML = recentRequests
    .map(
      (request) => `
        <tr>
          <td>${request.leave_type}</td>
          <td>${formatDate(request.start_date)}</td>
          <td>${formatDate(request.end_date)}</td>
          <td>${statusBadge(request.status)}</td>
        </tr>
      `
    )
    .join('');

  if (recentRequests.length === 0) {
    body.innerHTML = '<tr><td colspan="4">No leave requests found.</td></tr>';
  }
}

async function setupApplyLeavePage() {
  const user = await requireRole('employee');

  if (!user) {
    return;
  }

  const form = document.getElementById('applyLeaveForm');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const leaveType = document.getElementById('leaveType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const reason = document.getElementById('reason').value;

    try {
      const data = await apiRequest('/employee/apply-leave', {
        method: 'POST',
        body: JSON.stringify({ leaveType, startDate, endDate, reason })
      });

      showMessage(data.message, 'success');
      form.reset();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  });
}

async function loadLeaveHistoryPage() {
  const user = await requireRole('employee');

  if (!user) {
    return;
  }

  const data = await apiRequest('/employee/leave-history');
  const body = document.getElementById('historyBody');

  body.innerHTML = data.requests
    .map(
      (request) => `
        <tr>
          <td>${request.leave_type}</td>
          <td>${formatDate(request.start_date)}</td>
          <td>${formatDate(request.end_date)}</td>
          <td>${request.reason}</td>
          <td>${statusBadge(request.status)}</td>
          <td>${request.admin_comment || '-'}</td>
        </tr>
      `
    )
    .join('');

  if (data.requests.length === 0) {
    body.innerHTML = '<tr><td colspan="6">No leave requests found.</td></tr>';
  }
}

async function loadAdminRequests() {
  const status = document.getElementById('statusFilter').value;
  const data = await apiRequest(`/admin/requests?status=${encodeURIComponent(status)}`);
  const body = document.getElementById('adminRequestsBody');

  body.innerHTML = data.requests
    .map((request) => {
      const actions =
        request.status === 'Pending'
          ? `
            <div class="row-actions">
              <button onclick="approveRequest(${request.id})">Approve</button>
              <button class="danger" onclick="rejectRequest(${request.id})">Reject</button>
            </div>
          `
          : '-';

      return `
        <tr>
          <td>${request.employee_name}<br><span class="muted">${request.email}</span></td>
          <td>${request.department}</td>
          <td>${request.leave_type}</td>
          <td>${formatDate(request.start_date)} to ${formatDate(request.end_date)}</td>
          <td>${request.reason}</td>
          <td>${statusBadge(request.status)}</td>
          <td>${actions}</td>
        </tr>
      `;
    })
    .join('');

  if (data.requests.length === 0) {
    body.innerHTML = '<tr><td colspan="7">No leave requests found.</td></tr>';
  }
}

async function loadEmployees() {
  const data = await apiRequest('/admin/employees');
  const body = document.getElementById('employeesBody');

  body.innerHTML = data.employees
    .map(
      (employee) => `
        <tr>
          <td>${employee.name}</td>
          <td>${employee.email}</td>
          <td>${employee.department}</td>
          <td>${employee.leave_balance} days</td>
        </tr>
      `
    )
    .join('');
}

async function setupAdminDashboard() {
  const user = await requireRole('admin');

  if (!user) {
    return;
  }

  document.getElementById('statusFilter').addEventListener('change', loadAdminRequests);
  await loadAdminRequests();
  await loadEmployees();
}

async function approveRequest(id) {
  const comment = window.prompt('Enter approval comment:', 'Approved');

  await apiRequest(`/admin/approve/${id}`, {
    method: 'POST',
    body: JSON.stringify({ comment })
  });

  await loadAdminRequests();
  await loadEmployees();
}

async function rejectRequest(id) {
  const comment = window.prompt('Enter rejection comment:', 'Rejected');

  await apiRequest(`/admin/reject/${id}`, {
    method: 'POST',
    body: JSON.stringify({ comment })
  });

  await loadAdminRequests();
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  setupLogout();

  if (page === 'login') {
    setupLoginPage();
  }

  if (page === 'employee-dashboard') {
    loadEmployeeDashboard();
  }

  if (page === 'apply-leave') {
    setupApplyLeavePage();
  }

  if (page === 'leave-history') {
    loadLeaveHistoryPage();
  }

  if (page === 'admin-dashboard') {
    setupAdminDashboard();
  }
});
