const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'todos.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('error opening database', err.message);
    } else {
        console.log('connected to the database sucessfully.');
        db.run(`CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEST NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('error in creating table', err.message);
            }
        });
    }
});

module.exports = db;