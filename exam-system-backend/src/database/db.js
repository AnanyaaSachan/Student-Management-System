const { Database } = require('node-sqlite3-wasm');
const path         = require('path');
const fs           = require('fs');
const initSchema   = require('./schema');

const DB_PATH = process.env.DB_PATH || './data/exam_system.db';
const dir = path.dirname(path.resolve(DB_PATH));
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const _db = new Database(path.resolve(DB_PATH));

/**
 * Wraps a node-sqlite3-wasm Statement to match the better-sqlite3 API:
 *  - stmt.run(...args)  → stmt.run(args)
 *  - stmt.get(...args)  → stmt.get(args)
 *  - stmt.all(...args)  → stmt.all(args)
 *  - result.lastInsertRowid is always a Number
 */
function wrapStmt(stmt) {
  return {
    run(...args) {
      const info = stmt.run(args.length === 1 && Array.isArray(args[0]) ? args[0] : args);
      return {
        changes: info.changes,
        lastInsertRowid: Number(info.lastInsertRowid),
      };
    },
    get(...args) {
      return stmt.get(args.length === 1 && Array.isArray(args[0]) ? args[0] : args);
    },
    all(...args) {
      return stmt.all(args.length === 1 && Array.isArray(args[0]) ? args[0] : args);
    },
  };
}

/**
 * Wraps the Database to match the better-sqlite3 API:
 *  - db.prepare(sql)           → returns wrapped statement
 *  - db.exec(sql)              → same
 *  - db.transaction(fn)        → returns a function that runs fn inside BEGIN/COMMIT
 */
const db = {
  prepare(sql) {
    return wrapStmt(_db.prepare(sql));
  },
  exec(sql) {
    return _db.exec(sql);
  },
  transaction(fn) {
    return function(...args) {
      _db.exec('BEGIN');
      try {
        const result = fn(...args);
        _db.exec('COMMIT');
        return result;
      } catch (err) {
        _db.exec('ROLLBACK');
        throw err;
      }
    };
  },
};

initSchema(db);

module.exports = db;
