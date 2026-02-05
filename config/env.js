require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  DETA_PROJECT_KEY: process.env.DETA_PROJECT_KEY,
};
