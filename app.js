const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

//  get  all Todo list 
app.get('/todos', (req, res) => {
    db.all('SELECT * FROM todos ORDER BY created_at ASC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// add 
app.post('/todos', (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    db.run(
        'INSERT INTO todos (title, description) VALUES (?, ?)',
        [title, description || null],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                id: this.lastID,
                title,
                description: description || null,
                completed: false
            });
        }
    );
});

// update 
app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    let query = 'UPDATE todos SET ';
    const params = [];
    let updates = [];

    if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
    }

    if (description !== undefined) {
        updates.push('description = ?');
        params.push(description);
    }

    if (completed !== undefined) {
        updates.push('completed = ?');
        params.push(completed);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        
        db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(row);
        });
    });
});

//  delete
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM todos WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json({ message: 'Todo deleted successfully' });
    });
});

// error handlings for the api 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'something went wrong!' });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});