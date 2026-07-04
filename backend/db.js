const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'thomas.proxy.rlwy.net',
    database: process.env.DB_NAME || 'railway',
    password: process.env.DB_PASSWORD || 'ekrLNkiBdBOvQJDeuFtEoIVowQrCTssj',
    port: process.env.DB_PORT || 17441,
});

module.exports = pool;