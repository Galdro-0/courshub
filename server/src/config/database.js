import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storageDir = process.env.STORAGE_DIR || join(__dirname, '../..');
const dataDir = join(storageDir, 'data');
const dbPath = join(dataDir, 'courshub.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize SQL.js
const SQL = await initSqlJs();

// Load existing database or create new one
let db;
if (fs.existsSync(dbPath)) {
  const fileBuffer = fs.readFileSync(dbPath);
  db = new SQL.Database(fileBuffer);
} else {
  db = new SQL.Database();
}

// Save database to file
const saveDatabase = () => {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
};

// Create tables
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'owner')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    is_free INTEGER DEFAULT 1,
    price REAL DEFAULT 0,
    thumbnail TEXT,
    owner_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_id TEXT,
    payment_method TEXT DEFAULT 'simulation',
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE(user_id, course_id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`);

// Create default owner account if not exists
const existingOwner = db.exec('SELECT id FROM users WHERE role = ?', ['owner']);
if (existingOwner.length === 0 || existingOwner[0].values.length === 0) {
  const passwordHash = bcrypt.hashSync('admin123', 10);
  db.run(`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (?, ?, ?, ?)
  `, ['admin@courshub.com', passwordHash, 'Administrateur', 'owner']);
  console.log('Default owner account created: admin@courshub.com / admin123');
}

// Initialize default settings
const defaultSettings = [
  ['payment_enabled', 'true'],
  ['site_name', 'CoursHub'],
  ['site_description', 'Plateforme de cours en ligne']
];

for (const [key, value] of defaultSettings) {
  db.run('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', [key, value]);
}

// Save to file
saveDatabase();

// Wrapper object to mimic better-sqlite3 API
const dbWrapper = {
  prepare: (sql) => {
    return {
      run: (...params) => {
        db.run(sql, params);
        saveDatabase();
        return { lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] };
      },
      get: (...params) => {
        const result = db.exec(sql, params);
        if (result.length === 0 || result[0].values.length === 0) return undefined;
        const columns = result[0].columns;
        const values = result[0].values[0];
        const row = {};
        columns.forEach((col, i) => { row[col] = values[i]; });
        return row;
      },
      all: (...params) => {
        const result = db.exec(sql, params);
        if (result.length === 0) return [];
        const columns = result[0].columns;
        return result[0].values.map(values => {
          const row = {};
          columns.forEach((col, i) => { row[col] = values[i]; });
          return row;
        });
      }
    };
  },
  exec: (sql) => {
    db.run(sql);
    saveDatabase();
  },
  pragma: () => { }
};

export default dbWrapper;
