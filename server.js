const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./todos.db', (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        db.run(`
            CREATE TABLE IF NOT EXISTS todos (
                id TEXT PRIMARY KEY,
                task TEXT NOT NULL,
                completed BOOLEAN DEFAULT false
            )
        `);
    }
});

// Get all todos
app.get('/todos', (req, res) => {
    db.all('SELECT * FROM todos', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add a new todo
app.post('/todos', (req, res) => {
    const { task } = req.body;
    const id = uuidv4();
    db.run('INSERT INTO todos (id, task, completed) VALUES (?, ?, ?)', [id, task, false], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id, task, completed: false });
    });
});

// Toggle todo completion
app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    db.run('UPDATE todos SET completed = ? WHERE id = ?', [completed, id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json({ id, completed });
    });
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM todos WHERE id = ?', id, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json({ id });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
