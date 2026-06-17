require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'ekrLNkiBdBOvQJDeuFtEoIVowQrCTssj',
    database: process.env.DB_NAME || 'railway',
    host: process.env.DB_HOST || 'thomas.proxy.rlwy.net',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'ekrLNkiBdBOvQJDeuFtEoIVowQrCTssj',
    database: process.env.DB_NAME || 'railway',
    host: process.env.DB_HOST || 'thomas.proxy.rlwy.net',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 17441,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
