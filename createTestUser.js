const db = require('./config/database');

const createTestUser = () => {
  return new Promise((resolve, reject) => {
    const testUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      passwordHash: 'test-hash',
      role: 'regular',
      status: 'active'
    };

    db.run(
      `INSERT OR REPLACE INTO users (id, email, displayName, passwordHash, role, status, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [testUser.id, testUser.email, testUser.displayName, testUser.passwordHash, testUser.role, testUser.status],
      function (err) {
        if (err) {
          console.error('Error creating test user:', err);
          reject(err);
        } else {
          console.log('Test user created successfully');
          resolve();
        }
      }
    );
  });
};

createTestUser()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to create test user:', err);
    process.exit(1);
  });