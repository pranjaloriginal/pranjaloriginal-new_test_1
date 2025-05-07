// Main Express server, with sqlite3 "todos" table
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());

// Open the SQLite database, create table if not exists
let db;
(async () => {
    db = await open({
        filename: './todos.db',
        driver: sqlite3.Database
    });
    await db.exec(`CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0
    )`);
})();

// Helper to handle async errors
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  }
}

// GET /api/todos - list all todos
app.get('/api/todos', asyncHandler(async (req, res) => {
    const rows = await db.all('SELECT * FROM todos ORDER BY rowid DESC');
    res.json(rows.map(todo => ({ ...todo, completed: Boolean(todo.completed) })));
}));

// GET /api/todos/:id - get todo by id
app.get('/api/todos/:id', asyncHandler(async (req, res) => {
    const todo = await db.get('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    if (!todo) return res.status(404).json({ error: 'Not found' });
    todo.completed = Boolean(todo.completed);
    res.json(todo);
}));

// POST /api/todos - create a new todo
app.post('/api/todos', asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    const id = uuidv4();
    await db.run('INSERT INTO todos (id, title, description, completed) VALUES (?, ?, ?, ?)', [id, title.trim(), description || '', 0]);
    const newTodo = await db.get('SELECT * FROM todos WHERE id = ?', [id]);
    newTodo.completed = Boolean(newTodo.completed);
    res.status(201).json(newTodo);
}));

// PUT /api/todos/:id - update a todo
app.put('/api/todos/:id', asyncHandler(async (req, res) => {
    const { title, description, completed } = req.body;
    let todo = await db.get('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    if (!todo) return res.status(404).json({ error: 'Not found' });

    // Validation
    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return res.status(400).json({ error: 'Title cannot be empty.' });
    }
    const newTitle = title !== undefined ? title.trim() : todo.title;
    const newDesc = description !== undefined ? description : todo.description;
    const newCompleted = completed === undefined ? todo.completed : (completed ? 1 : 0);

    await db.run('UPDATE todos SET title=?, description=?, completed=? WHERE id=?', [newTitle, newDesc, newCompleted, req.params.id]);
    const updatedTodo = await db.get('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    updatedTodo.completed = Boolean(updatedTodo.completed);
    res.json(updatedTodo);
}));

// DELETE /api/todos/:id - delete a todo
app.delete('/api/todos/:id', asyncHandler(async (req, res) => {
    const { changes } = await db.run('DELETE FROM todos WHERE id = ?', [req.params.id]);
    if (!changes) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
}));

// Handle errors
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error.' });
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
