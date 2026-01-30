const db = require('./config/database');

const addProfileColumns = () => {
  return new Promise((resolve, reject) => {
    const alterQueries = [
      'ALTER TABLE users ADD COLUMN whatsapp TEXT',
      'ALTER TABLE users ADD COLUMN instagram TEXT', 
      'ALTER TABLE users ADD COLUMN tiktok TEXT',
      'ALTER TABLE users ADD COLUMN facebook TEXT'
    ];

    let completed = 0;
    alterQueries.forEach((query) => {
      db.run(query, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Migration error:', err);
          reject(err);
          return;
        }
        completed++;
        if (completed === alterQueries.length) {
          console.log('Profile columns added successfully');
          resolve();
        }
      });
    });
  });
};

if (require.main === module) {
  addProfileColumns()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { addProfileColumns };