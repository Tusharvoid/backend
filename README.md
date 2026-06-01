# Employee Leave Management System

A simple college mini-project where employees apply for leave and admins approve or reject requests.

## Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MySQL
- Authentication: bcrypt password hashing and Express session login

## Folder Structure

```text
employee-leave-system/
├── server.js
├── db.js
├── package.json
├── routes/
│   ├── auth.js
│   ├── employee.js
│   └── admin.js
├── views/
│   ├── login.html
│   ├── employee-dashboard.html
│   ├── apply-leave.html
│   ├── leave-history.html
│   └── admin-dashboard.html
├── public/
│   ├── css/style.css
│   └── js/script.js
├── database.sql
└── .env.example
```

## File Explanation

- `server.js`: Starts Express, configures sessions, serves HTML/CSS/JS files, and connects route files.
- `db.js`: Creates the MySQL connection pool.
- `routes/auth.js`: Handles login, logout, and current user checks.
- `routes/employee.js`: Handles employee profile, balance, apply leave, and history APIs.
- `routes/admin.js`: Handles admin request list, employee list, approve, and reject APIs.
- `views/`: Contains simple static HTML pages.
- `public/css/style.css`: Contains all page styling.
- `public/js/script.js`: Contains browser-side fetch calls and table rendering.
- `database.sql`: Creates tables and inserts sample users and requests.

## Setup Instructions

1. Install Node.js and MySQL.

   This machine already has Node.js available. If MySQL is missing, install it or connect to an existing MySQL server.

2. Install project dependencies.

   ```bash
   cd employee-leave-system
   npm install
   ```

3. Create the MySQL database.

   ```bash
   mysql -u root -p < database.sql
   ```

4. Create your environment file.

   ```bash
   cp .env.example .env
   ```

   Edit `.env` if your MySQL username or password is different.

5. Start the project.

   ```bash
   npm start
   ```

6. Open the app.

   ```text
   http://localhost:3000
   ```

## Sample Login

```text
Admin:
Email: admin@example.com
Password: admin123

Employee:
Email: employee@example.com
Password: employee123
```

## Database Schema

### users

| Column | Type | Purpose |
| --- | --- | --- |
| id | INT | Primary key |
| name | VARCHAR(100) | User full name |
| email | VARCHAR(100) | Login email |
| password | VARCHAR(255) | bcrypt hashed password |
| role | ENUM | `employee` or `admin` |
| department | VARCHAR(100) | Employee department |
| leave_balance | INT | Available leave days |
| created_at | TIMESTAMP | Account creation time |

### leave_requests

| Column | Type | Purpose |
| --- | --- | --- |
| id | INT | Primary key |
| employee_id | INT | Foreign key connected to users table |
| leave_type | ENUM | Sick Leave, Casual Leave, Annual Leave |
| start_date | DATE | Leave start date |
| end_date | DATE | Leave end date |
| reason | TEXT | Reason entered by employee |
| status | ENUM | Pending, Approved, Rejected |
| admin_comment | VARCHAR(255) | Admin approval or rejection comment |
| created_at | TIMESTAMP | Request creation time |

## ER Diagram

```text
+-------------------+          +------------------------+
| users             |          | leave_requests         |
+-------------------+          +------------------------+
| id (PK)           |<---------| employee_id (FK)       |
| name              |   1   M  | id (PK)                |
| email             |          | leave_type             |
| password          |          | start_date             |
| role              |          | end_date               |
| department        |          | reason                 |
| leave_balance     |          | status                 |
| created_at        |          | admin_comment          |
+-------------------+          | created_at             |
                               +------------------------+
```

## System Architecture Diagram

```text
User Browser
    |
    | HTML pages + fetch API calls
    v
Express.js Server
    |
    | Route files
    | - auth.js
    | - employee.js
    | - admin.js
    v
MySQL Database
    |
    | users and leave_requests tables
    v
Stored login users, leave requests, status, and leave balance
```

## Main Workflows

### Employee Workflow

1. Employee logs in.
2. Employee opens the dashboard and sees leave balance.
3. Employee submits a leave request.
4. Request is stored as `Pending`.
5. Employee checks leave history to see status.

### Admin Workflow

1. Admin logs in.
2. Admin sees all leave requests.
3. Admin filters requests by status.
4. Admin approves or rejects pending requests.
5. If approved, the employee leave balance is reduced.

## Important API Routes

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/auth/login` | Login employee or admin |
| POST | `/auth/logout` | Logout current user |
| GET | `/auth/me` | Check current logged-in user |
| GET | `/employee/profile` | Get employee details |
| GET | `/employee/balance` | Get employee leave balance |
| POST | `/employee/apply-leave` | Submit leave request |
| GET | `/employee/leave-history` | View employee request history |
| GET | `/admin/requests` | View all leave requests |
| GET | `/admin/employees` | View employee details |
| POST | `/admin/approve/:id` | Approve leave request |
| POST | `/admin/reject/:id` | Reject leave request |

## Viva Questions and Answers

**Q1. What is the purpose of this project?**  
It helps employees apply for leave online and allows admins to approve or reject those requests.

**Q2. Why did you use bcrypt?**  
bcrypt hashes passwords, so plain passwords are not stored in the database.

**Q3. What is session-based authentication?**  
After login, the server stores the user details in a session. The browser keeps a session cookie and uses it for later requests.

**Q4. What are the main tables?**  
The main tables are `users` and `leave_requests`.

**Q5. How do you separate admin and employee access?**  
The server checks `req.session.user.role`. Employee routes allow only employees, and admin routes allow only admins.

**Q6. When is leave balance reduced?**  
Leave balance is reduced only when an admin approves a pending leave request.

**Q7. What happens when a request is rejected?**  
The request status changes to `Rejected`, and leave balance is not changed.

**Q8. Why did you use MySQL?**  
MySQL is suitable because the project has structured relational data, such as users and leave requests.

**Q9. Why did you not use JWT?**  
The project is designed to be simple and beginner-friendly, so Express sessions are easier to explain.

**Q10. How does the frontend communicate with the backend?**  
The frontend uses JavaScript `fetch()` calls to send and receive JSON data from Express routes.

## Project Explanation for Presentation

This project is an Employee Leave Management System. It has two roles: employee and admin. Employees can log in, check their leave balance, apply for leave, and view leave history. Admins can log in, view all leave requests, filter them by status, and approve or reject requests.

The backend is built with Node.js and Express.js. Authentication uses sessions, and passwords are checked with bcrypt. The database is MySQL and contains two tables: `users` and `leave_requests`. When an employee submits leave, the request is saved with `Pending` status. When the admin approves it, the system calculates the number of leave days and subtracts them from the employee's leave balance.

The frontend is built using simple HTML, CSS, and JavaScript. The UI is intentionally simple so the project is easy to understand and explain during viva.
