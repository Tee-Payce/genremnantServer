const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./config/database');

const adminEmail = 'teepayce11@gmail.com';
const adminPassword = '123pass#';
const adminDisplayName = 'Admin User';

// Hash the password
bcrypt.hash(adminPassword, 10, (err, passwordHash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }

  const userId = uuidv4();

  // Insert admin user
  db.run(
    `INSERT INTO users (id, email, displayName, passwordHash, role, status) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, adminEmail, adminDisplayName, passwordHash, 'admin', 'active'],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          console.log('❌ Admin user already exists with this email');
        } else {
          console.error('❌ Error creating admin user:', err);
        }
        process.exit(1);
      }

      console.log('✅ Admin user created successfully!');
      console.log(`
📧 Email: ${adminEmail}
🔑 Password: ${adminPassword}
👤 Role: admin
🆔 User ID: ${userId}
      `);
      process.exit(0);
    }
  );
});
