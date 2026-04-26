const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');
const initSchema = require('./schema');

const DB_PATH = process.env.DB_PATH || './data/exam_system.db';
const dir = path.dirname(path.resolve(DB_PATH));
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(path.resolve(DB_PATH));
initSchema(db);

module.exports = db;
