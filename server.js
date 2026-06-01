const path = require('path');
const express = require('express');
const session = require('express-session');
require('dotenv').config();

const db = require('./db');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const adminRoutes = require('./routes/admin');

function createApp(database = db) {
  const app = express();

  // Store the database object on the app so routes can use it.
  // Tests can pass a fake database without changing route code.
  app.locals.db = database;

  // Read JSON data sent from fetch() and normal HTML forms.
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Session stores the logged-in user's id, name, and role.
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'college-mini-project-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60
      }
    })
  );

  // Serve CSS/JS files and simple HTML pages.
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'views')));

  app.get('/', (req, res) => {
    res.redirect('/login.html');
  });

  app.use('/auth', authRoutes);
  app.use('/employee', employeeRoutes);
  app.use('/admin', adminRoutes);

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Employee Leave Management System running at http://localhost:${port}`);
    db.testConnection();
  });
}

module.exports = { createApp };
